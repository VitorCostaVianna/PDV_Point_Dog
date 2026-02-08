# 🐶 Point Dog PDV - Sistema de Gestão & Frente de Caixa

> **Solução Desktop otimizada para o varejo de bairro.**

![Status do Projeto](https://img.shields.io/badge/STATUS-EM_DESENVOLVIMENTO-orange)
![Java](https://img.shields.io/badge/Java-21%2B-red)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green)
![React](https://img.shields.io/badge/React-Vite-blue)

## Sobre o Projeto

Este sistema foi desenvolvido sob medida para a **Point Dog Pet Shop**, um estabelecimento tradicional que atua há mais de **27 anos** no mercado, oferecendo produtos e serviços de excelência para a comunidade local.

Diferente da tendência atual de sistemas 100% em nuvem (SaaS), este projeto foi arquitetado como uma **solução Desktop Local (On-Premise)**. O objetivo foi resolver dores reais do cliente: necessidade de altíssima velocidade no caixa, funcionamento offline (independência da internet) e custo zero com servidores mensais.

O sistema foca no essencial: realizar vendas de forma ágil, gerenciar histórico de clientes e emitir comprovantes não fiscais instantaneamente.

---

##  Destaques Técnicos & Funcionalidades

###  Impressão Térmica Nativa (Hardware)
Um dos grandes diferenciais do projeto. Diferente de sistemas web que abrem a janela de impressão do navegador (PDF), o Point Dog PDV comunica-se **diretamente com o driver/porta da impressora** (Ex: Elgin i9, Epson TM-T20).
* **Tecnologia:** Protocolo ESC/POS via Java.

### Otimização para Hardware Modesto (Low-Spec)
O sistema foi projetado para rodar em computadores com recursos limitados (ex: 4GB de RAM), comuns em balcões de lojas.
* **Backend:** Configuração fina do JVM (`-Xmx512m`) e Garbage Collector para baixo consumo de memória.
* **Frontend:** Uso intenso de `useMemo` e `Lazy Loading` para evitar renderizações desnecessárias.
* **Banco de Dados:** H2 Database em modo arquivo com índices otimizados (`@Index`) para buscas instantâneas mesmo com milhares de registros.

###  Arquitetura Desktop-First
* **Frontend:** React + Vite rodando localmente.
* **Backend:** Spring Boot servindo como API e gerenciador de hardware.
* **Start-up:** Script `.bat` personalizado que sobe todo o ambiente com um clique, sem necessidade de configuração técnica pelo usuário final.

---

## Stack Utilizada

A escolha da stack visou robustez, facilidade de manutenção e tipagem estática.

### Backend (Java Ecosystem)
* **Java 21 / Spring Boot 3:** Para estabilidade e injeção de dependência.
* **H2 Database:** Banco de dados SQL embutido (file-based). Escolhido por não exigir instalação de um servidor de banco separado (como MySQL/Postgres), facilitando a instalação na máquina do cliente.
* **EscPos (Anastacio Cintra):** Biblioteca para comunicação raw com impressoras térmicas.
* **Lombok:** Para redução de código boilerplate.

### Frontend (React Ecosystem)
* **React + TypeScript:** Para interfaces reativas e segurança de tipos.
* **Vite:** Build tool extremamente rápida.
* **Tailwind CSS:** Para estilização rápida e responsiva.
* **Lucide React:** Ícones leves e modernos.
* **React-Select:** Componente robusto para busca de produtos e clientes.

### Identidade Visual
* Paleta de cores personalizada baseada na marca Point Dog:
    * **Laranja Principal:** `#F28322`
    * **Laranja Destaque:** `#F68C3F`

---

## Estrutura do Projeto

O projeto segue uma **Arquitetura em Camadas (Layered Architecture)** clássica e limpa:

```text
src/
├── controller/  # Endpoints da API (REST)
├── service/     # Regras de Negócio e Lógica de Impressão
├── repository/  # Acesso a Dados (Spring Data JPA)
├── model/       # Entidades do Banco (ORM)
└── dto/         # Objetos de Transferência de Dados
```

## Como Rodar o Projeto
### Pré-requisitos
* Java JDK 17 ou superior.
* Node.js 18 ou superior.
* Impressora Térmica (Opcional - o sistema emula no console se não houver).

### Passo a Passo

Clone o repositório

```Bash
git clone [https://github.com/seu-usuario/point-dog-pdv.git](https://github.com/seu-usuario/point-dog-pdv.git)
```

### Subir o Backend
```Bash
cd point-dog-pdv
./mvnw spring-boot:run
```

### Subir o Frontend
```Bash
cd frontend
npm install
npm run dev
```
Acesse: http://localhost:5173

## Configuração de Produção (Deploy Local)
Para o ambiente do cliente, utilizamos um script de inicialização otimizado (iniciar_sistema.bat) que:

* Limita a memória do Java para proteger o Windows.

* Desativa logs desnecessários.

* Inicia o servidor de banco de dados em modo servidor (Auto-Server).

```Bash
java -Xms256m -Xmx512m -jar sistema-gerenciamento-point-dog.jar
```

📞 Contato
Desenvolvido por Vitor Costa.

LinkedIn:https://www.linkedin.com/in/vitor-costa-vianna-5449832b8/

Email: vitorcostavianna@gmail.com

Feito com 🧡 para a comunidade Point Dog.
