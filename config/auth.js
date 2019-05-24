//PARTE RESPONSÁVEL PELA ALTENTICAÇÃO DE UM USUÁRIO NO BANCO DE DADOS

const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Carregar model de usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function (passport) {

    //coloco o campo que quero analisar, neste caso é o email (poderia ser o numero de matricula, nome de usuario, etc)
    passport.use(new localStrategy({ usernameField: "email", passwordField: "senha"}, function (email, senha, done) {
        Usuario.findOne({ email: email }).then(function (usuario) {
            //se ele não achar um usuário
            if (!usuario) {
                //done() é uma função de callback que esta sendo passada como parametro 
                //no done eu passo 3 parametros 
                //null = passo os dados da conta que esta sendo altenticada, esta null por que nenhuma conta foi autenticada
                //false = se a altentificação aconteceu com sucesso ou não, neste caso como ela não maconteceu com sucesso fica false 
                //{message: "Esta conta não existe"} = menssagem de erro
                return done(null, false, { message: "Esta conta não existe" })
            }

            bcrypt.compare(senha, usuario.senha, function (error, batem) {
                //se as senhas baterem ...
                if (batem) {
                    return done(null, usuario)
                } else {
                    return done(null, false, { message: "Senha incorreta" })
                }
            })
        })
    }))

    //AS PROSIMAS 2 FUNÇÕES SERVEM PARA SALVAR OS DADOS DO USUÁRIO NA SEÇÃO, ASSIMQUE O USUARIO LOGAR NO SITE OS DADOS DELE VÃO SER SALVOS EM UMA SEÇÃO  

    passport.serializeUser(function (usuario, done) {
        done(null, usuario.id)
    })

    passport.deserializeUser(function (id, done) {
        //serve para procurar um usuario pelo id dele
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })

}