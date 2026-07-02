from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from manus_shared.database import get_db, engine, Base
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tasks Service")

class TaskCreate(BaseModel):
    title: str
    description: str

@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    # Logic to fetch tasks from DB would go here
    return [{"id": 1, "title": "Demo Task", "description": "This is a demo task"}]

@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # Logic to save task to DB would go here
    return {"message": "Task created successfully"}
