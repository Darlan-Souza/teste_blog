const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs") // para senhas
//carregando o passport
const passport = require("passport")

router.get('/registro', function (req, res) {
    res.render("usuarios/registro")
})

//as rotas tem o mesmo caminho mais o tipo delas é diferente uma é get e a outra é post
router.post("/registro", function (req, res) {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email inválido" })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" })
    }

    //verifico se a senha que digitei nos dois campos é igual
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente" })
    }

    if (erros.length > 0) {
        /*************EACH ***********************/
        //mostros os erros com {erros: erros} e pego eles em usuarios/registro através do each
        res.render("usuarios/registro", { erros: erros })
    } else {
        //verifico se o usuario que esta se cadastrando não esta colocando um email que já existe dentro do banco 
        Usuario.findOne({ email: req.body.email }).then(function (usuario) {
            //se ele retornar um usuário e seu email já estiver cadastrado
            if (usuario) {
                req.flash("error_msg", "Já existe um conta com esse email no sistema")
                res.redirect("/usuarios/registro")
            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                    //também temos o campo eAdmin mas ele já tem o valor padrão que é 0
                })

                //encriptando a senha 
                //salt é um valor aleatório misturado com a hash

                bcrypt.genSalt(10, function (erro, salt) {
                    bcrypt.hash(novoUsuario.senha, salt, function (erro, hash) {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(function () {
                            req.flash("success_msg", "Usuário criado com sucesso")
                            res.redirect("/")
                        }).catch(function (err) {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch(function (err) {
            req.flash("error_msg", "Gouve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", function (req, res) {
    res.render("usuarios/login")
})

//ROTA DE AUTENTICAÇÃO = como é uma rota de autenticação vamos precisar de 3 parametros, req, res, next
router.post("/login", function (req, res, next) {
    //authenticate() é usada sempre quando quero autenticar alguma coisa
    passport.authenticate("local", {
        //successRedirect: define o caminho que sera direcionado caso a autenticação ocorra com sucesso 
        successRedirect: "/",
        //caso ocorra uma falha durante a autenticação defino outra rota
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

//usuario fazer logout do sistema 
router.get("/logout", function(req, res){
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})
//Sempre fica por ultimo
module.exports = router 