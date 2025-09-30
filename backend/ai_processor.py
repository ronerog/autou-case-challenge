import google.generativeai as genai
import os
import json
from dotenv import load_dotenv 

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def get_analysis(email_content: str, custom_prompt: str, temperature: float):
    base_prompt = f"""
    Você é um assistente de IA especialista em análise de documentos e e-mails. Sua tarefa é analisar o conteúdo fornecido e seguir as instruções do usuário.

    O usuário forneceu um texto principal (pode ser um e-mail ou uma instrução direta) e, opcionalmente, o conteúdo de um documento anexado.

    **Texto Principal / E-mail do Usuário:**
    ---
    {email_content}
    ---
    
    **Instruções Adicionais do Usuário:**
    ---
    {custom_prompt if custom_prompt else "Nenhuma instrução adicional."}
    ---

    **Sua Tarefa:**
    Com base em TODO o conteúdo acima, realize as seguintes tarefas:

    1.  **Classificação:** Classifique o contexto geral em 'Produtivo' ou 'Improdutivo'.
    2.  **Geração de Resposta:** Crie uma resposta que atenda ao que foi solicitado no texto principal, interpretando as informações do documento anexado se necessário.
    3.  **Extração de Ação:** Identifique a próxima ação concreta sugerida no texto. Se não houver, retorne "Nenhuma sugestão de ação".

    **Formato de Saída Obrigatório (JSON):**
    Retorne sua análise estritamente no seguinte formato JSON, sem nenhum texto adicional antes ou depois:
    {{
      "classification": "...",
      "suggested_response": "...",
      "suggested_action": "..."
    }}
    """
    
    try:
        model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
        generation_config = genai.types.GenerationConfig(temperature=temperature)
        response = model.generate_content(base_prompt, generation_config=generation_config)
        
        result_text = response.text
        cleaned_text = result_text.strip().replace("```json", "").replace("```", "")
        result_json = json.loads(cleaned_text)
        return result_json
    except Exception as e:
        print(f"Erro na API do Gemini (get_analysis): {e}")
        return {"error": "Falha na análise inicial do e-mail."}

def refine_response(original_text: str, variation_type: str):
    prompts = {
        'formal': f"Reescreva o seguinte texto em um tom mais formal e profissional:\n\n{original_text}",
        'casual': f"Reescreva o seguinte texto em um tom mais casual e amigável, mas ainda profissional:\n\n{original_text}",
        'summarize': f"Resuma o seguinte texto em uma única frase concisa:\n\n{original_text}"
    }
    if variation_type not in prompts:
        return {"error": "Tipo de variação inválido."}
    try:
        model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
        response = model.generate_content(prompts[variation_type])
        return {"refined_response": response.text}
    except Exception as e:
        print(f"Erro na API do Gemini (refine_response): {e}")
        return {"error": "Não foi possível refinar a resposta."}