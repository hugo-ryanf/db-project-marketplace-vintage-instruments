from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Marketplace Vintage Instruments",
    description="API de instrumentos musicais antigos - Banco de Dados I"
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota de teste
@app.get("/")
def raiz():
    return {"mensagem": "API Marketplace Vintage Instruments funcionando!"}