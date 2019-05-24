const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    //quando o usuário se cadastrar no sistema seu campo por padrão será igual a 0
    //isso quer dizer que ele não é admin 
    //quando esse campo for igual a 1 ele é um usuario administrador
    eAdmin:{
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})

//hash é melhor que criptografia por que criptografia é reversível, já a hash eu nunca consigo reverter

mongoose.model("usuarios", Usuario)