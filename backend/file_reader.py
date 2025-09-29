from fastapi import UploadFile
import PyPDF2
import io

async def read_txt_from_upload(file: UploadFile) -> str:
    """Lê o conteúdo de um arquivo .txt enviado."""
    contents = await file.read()
    return contents.decode('utf-8')

def read_pdf_from_upload(file: UploadFile) -> str:
    """Lê o conteúdo de um arquivo .pdf enviado."""
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print(f"Erro ao ler PDF: {e}")
        return "Erro ao extrair texto do PDF."
    return text