import pytest
from packages.shared.security import hash_password, verify_password, create_access_token, decode_token

def test_password_hashing():
    password = "testpassword"
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_creation_and_decoding():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(user_id)
    decoded_payload = decode_token(token)
    assert decoded_payload["sub"] == user_id
    assert decoded_payload["type"] == "access"
    assert "exp" in decoded_payload
    assert "iat" in decoded_payload

    # Test with a dummy secret key to ensure it fails with wrong key
    from jose import jwt, JWTError
    from packages.shared.config import get_settings
    settings = get_settings()
    original_secret = settings.secret_key
    settings.secret_key = "wrong-secret"
    with pytest.raises(JWTError):
        decode_token(token)
    settings.secret_key = original_secret # Restore original secret
