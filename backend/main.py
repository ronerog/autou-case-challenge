# backend/main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import ai_processor
import file_reader

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-email")
async def process_email(
    email_text: Optional[str] = Form(''), 
    file: Optional[UploadFile] = File(None),
    custom_prompt: Optional[str] = Form(''),
    temperature: float = Form(0.2)
):
    user_text = email_text if email_text else ''
    file_content = ""

    if file:
        if file.content_type == 'text/plain':
            file_content = await file_reader.read_txt_from_upload(file)
        elif file.content_type == 'application/pdf':
            file_content = file_reader.read_pdf_from_upload(file)
        else:
            raise HTTPException(status_code=400, detail="Formato de arquivo não suportado.")

    if not user_text.strip() and not file_content.strip():
        raise HTTPException(status_code=400, detail="Nenhum conteúdo fornecido (texto ou arquivo).")

    combined_content = user_text
    if file_content:
        combined_content += "\n\n--- CONTEÚDO DO ARQUIVO ANEXADO ---\n" + file_content

    result = ai_processor.get_analysis(combined_content, custom_prompt, temperature)
    return result

class RefineRequest(BaseModel):
    original_response: str
    variation_type: str

@app.post("/refine-response")
async def refine_response_endpoint(request: RefineRequest):
    result = ai_processor.refine_response(request.original_response, request.variation_type)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result