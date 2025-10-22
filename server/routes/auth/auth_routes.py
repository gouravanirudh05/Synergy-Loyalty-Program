from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
import httpx
from config import CLIENT_ID, CLIENT_SECRET, FRONTEND_URL, ADMIN_EMAIL

router = APIRouter(prefix="/api", tags=["Auth"])
oauth = OAuth()
volunteer_collection = None

def init_collections(vc):
    global volunteer_collection
    volunteer_collection = vc

oauth.register(
    name='microsoft',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url='https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile User.Read', 'verify_iss': False}
)

@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.microsoft.authorize_redirect(request, redirect_uri)

@router.get("/auth")
async def auth(request: Request):
    try:
        code = request.query_params.get("code")
        if not code:
            return JSONResponse(status_code=400, content={"error": "Missing code"})

        token_url = "https://login.microsoftonline.com/organizations/oauth2/v2.0/token"
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                token_url,
                data={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": str(request.url_for('auth')),
                    "scope": "openid email profile User.Read",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Token exchange failed")

        async with httpx.AsyncClient() as client:
            user_resp = await client.get(
                "https://graph.microsoft.com/v1.0/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )

        user_data = user_resp.json()
        email = user_data.get("mail") or user_data.get("userPrincipalName")
        if not email or not email.endswith("@iiitb.ac.in"):
            raise HTTPException(status_code=403, detail="Access Denied")

        name = user_data.get("displayName")
        roll_number = user_data.get("employeeId", "N/A")
        role = "admin" if email.lower() == ADMIN_EMAIL.lower() else "participant"

        if volunteer_collection is not None and await volunteer_collection.find_one({"rollNumber": roll_number}) is not None:
            role = "volunteer"

        request.session["user"] = {
            "name": name, "email": email, "rollNumber": roll_number, "role": role
        }

        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard")

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")

@router.get("/logout")
async def logout(request: Request):
    request.session.pop("user", None)
    return RedirectResponse(url=FRONTEND_URL or "/")

@router.get("/user/profile")
async def profile(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return JSONResponse(content=user)
