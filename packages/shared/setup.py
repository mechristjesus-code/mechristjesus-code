from setuptools import setup, find_packages

setup(
    name="cdna-shared",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "sqlalchemy",
        "pydantic-settings",
        "python-jose",
        "passlib",
        "python-multipart",
        "redis",
    ],
)
