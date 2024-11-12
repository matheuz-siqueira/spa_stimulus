import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.renderLista()
  }

  static base_uri = "http://localhost:3000"

  async cadastrar(event){
    event.preventDefault() 
    const nome = event.target.querySelector("#nome").value
    const telefone = event.target.querySelector("#telefone").value
    const matricula = event.target.querySelector("#matricula").value

    if(!nome || nome == ""){
      alert('O nome é obrigatório')
      event.target.querySelector("#nome").focus()
      return 
    }

    if(!telefone || telefone == ""){
      alert('O telefone é obrigatório')
      event.target.querySelector("#telefone").focus()
      return 
    }

    if(!matricula || matricula == ""){
      alert('A matricula é obrigatório')
      event.target.querySelector("#matricula").focus()
      return 
    }

    const payload = {
      aluno: {
        nome: nome, 
        telefone: telefone, 
        matricula: matricula
      }
    }

    try{
      const response = await fetch(`${this.constructor.base_uri}/alunos`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      })
      if(!response.ok){
        if(response.status == 422){
          const erros = await response.json() 
          let mensagensErro = "Por favor corrija os seguintes erros:\n" 
          for(const [campo, menssagens] of Object.entries(erros)){
            menssagens.forEach(mensagem => {
              mensagensErro += `- ${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${mensagem}\n`;
            })
          }
          alert(mensagensErro)
          return 
        }else {
          throw new Error(`Erro HTTP ${response.status}`)
        }
      }
      this.renderLista()


    }catch(error){
      console.error("Erro ao enviar dados", error.message)
    }
    


  }

  async atualizar(event){
    event.preventDefault() 
    const id = parseInt(event.target.querySelector("#id").value, 10);
    const nome = event.target.querySelector("#nome").value
    const telefone = event.target.querySelector("#telefone").value
    const matricula = event.target.querySelector("#matricula").value

    const payload = {
      nome: nome, 
      telefone: telefone, 
      matricula: matricula
    }
    
    try {
      const url = `${this.constructor.base_uri}/alunos/${id}`
      const response = await fetch(url, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      })


      if(!response.ok){
        if(response.status == 422){
          const erros = await response.json() 
          let mensagensErro = "Por favor corrija os seguintes erros:\n" 
          for(const [campo, menssagens] of Object.entries(erros)){
            menssagens.forEach(mensagem => {
              mensagensErro += `- ${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${mensagem}\n`;
            })
          }
          alert(mensagensErro)
          return 
        }else {
          throw new Error(`Erro HTTP ${response.status}`)
        }
      }
      this.renderLista()

    }catch(error){
      console.log(error)
    }
    
  }

  novo(){
    this.element.innerHTML = `
      <form data-action="submit->alunos#cadastrar">
        <div class="mb-3">
          <label for="nome" class="form-label">Nome</label>
          <input type="text" class="form-control" id="nome" placeholder="Digite seu nome" >
        </div>

        <div class="mb-3">
          <label for="telefone" class="form-label">Telefone</label>
          <input type="tel" class="form-control" id="telefone" placeholder="Digite seu telefone" >
        </div>

        <div class="mb-3">
          <label for="matricula" class="form-label">Matrícula</label>
          <input type="text" class="form-control" id="matricula" placeholder="Digite sua matrícula" >
        </div>

        <br>
        <button type="submit" class="btn btn-primary">Cadastrar</button>
        <button type="button" data-action="click->alunos#renderLista" class="btn btn-secondary">Cancelar</button>
      </form>
    `
  }

  async renderLista(){

    try{
      const response = await fetch(`${this.constructor.base_uri}/alunos`, { method: 'GET' }) 
      if(!response.ok){
        throw new Error(`Erro HTTP: ${response.status}`) 
      }
      const alunos = await response.json()


      if(alunos.length > 0){
      
      this.element.innerHTML = `

        <button class="btn btn-primary" data-action="click->alunos#novo"> Novo </button>
        <hr>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nome</th>
              <th scope="col">Telefone</th>
              <th scope="col">Matricula</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            ${
              alunos.map(aluno => `
                <tr>
                  <td>${aluno.id}</td>
                  <td>${aluno.nome}</td>
                  <td>${aluno.telefone}</td>
                  <td>${aluno.matricula}</td>
                  <td>
                    <button type="button"  data-action="click->alunos#editar" data-aluno-id=${aluno.id} class="btn btn-warning">Editar</button>
                    <button type="button"  data-action="click->alunos#excluir" data-aluno-id=${aluno.id} class="btn btn-danger">Apagar</button>
                  </td>
                </tr>`
              ).join('')
            }
          </tbody>
        </table>
        `
      }else{
        this.element.innerHTML = `<h3>Não existe alunos cadastrados</h3>`
      }
    }catch (err){
      console.error("Erro ao buscar os dados", err.message)
    }
  }

  async getAluno(id){
    const url = `${this.constructor.base_uri}/alunos/${id}` 
    try{
      const respose = await fetch(url, {
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' } 
      })
      if(!respose.ok){
        throw new Error(`Erro HTTP: ${respose.status}`)
      }
      const result = await respose.json() 
      return result

    }catch(err){
      console.err("Erro ao buscar aluno", err.message)
    }
  }

  async editar(event){
    this.element.innerHTML = `Carregando ...`
    const id = event.currentTarget.dataset.alunoId 
    const aluno = await this.getAluno(id) 

    this.element.innerHTML += `
      <form data-action="submit->alunos#atualizar">
        <input type="hidden" class="form-control" id="id" value="${aluno.id}  >  

        <div class="mb-3">
          <label for="nome" class="form-label">Nome</label>
          <input type="text" class="form-control" id="nome" value="${aluno.nome} "placeholder="Digite seu nome" >
        </div>

        <div class="mb-3">
          <label for="telefone" class="form-label">Telefone</label>
          <input type="tel" class="form-control" id="telefone" value="${aluno.telefone}" placeholder="Digite seu telefone" >
        </div>

        <div class="mb-3">
          <label for="matricula" class="form-label">Matrícula</label>
          <input type="text" class="form-control" id="matricula" value="${aluno.matricula}" placeholder="Digite sua matrícula" >
        </div>

        <br>
        <button type="submit" class="btn btn-primary">Enviar</button>
        <button type="button" data-action="click->alunos#renderLista" class="btn btn-secondary">Cancelar</button>
      </form>
    `
  }

  async excluir(event){
    const id = event.currentTarget.dataset.alunoId 
    if(confirm('Tem certeza?')){
      try{
        const url = `${this.constructor.base_uri}/alunos/${id}`
        const response = await fetch(url, {
          method: 'DELETE', 
          headers: { 'Content-Type': 'application/json'}
        })

        if(!response.ok){
          throw new Error(`Erro HTTP: ${response.status}`)
        }

        this.renderLista()
      }catch(error){
        console.error("Erro ao tentar excluir", error.message) 
      }
    }
  }
}


