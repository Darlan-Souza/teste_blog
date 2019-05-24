/*CARREGANDO MODULOS*/
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require("./routes/admin")
    //o módulo path serve para manipulação de pastas
    const path = require('path')
    const mongoose = require('mongoose');
    const session = require('express-session')
    const flash = require('connect-flash')
    //carregando o model de postagens e categorias (tenho que fazer isso já que vou usar os dados que estão p´resentes neles)
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    //chamo o arquivo de conexão com o banco
    const db = require("./config/db")

/*CONFIGURAÇÕES*/
    //Sessão

    //ORDEM 
    //Primeiro executo a sessão
    //Segundo executo o passport
    //terceiro executo o flash

        //app.use = serve para criação e configuração de midlewares
        app.use(session({
            //chave que gera sessão
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    //Midleware DECLARO VARIAVEIS GLOBAIS QUE VÃO SER CHAMADAS EM TODO SISTEMA
        app.use(function(req, res, next){
            //crio variáveis globais
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            //mostra os erros de acesso ao realizar o login (senha ou email incorretos)
            res.locals.error = req.flash("error")
            //res.locals.use = será responsável por armazenar os dados do usuário autenticado
            //req.user = criado pelo passport para armazena dados do usuario logado, se não existir nenhum usuario logado será passado o null
            res.locals.user = req.user || null;
            next()
        })
        
    //body-parser 
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))  
        app.set('view engine', 'handlebars')
    //Mongoose
    mongoose.Promise = global.Promise; 
        mongoose.connect(db.mongoURI).then(function(){
            console.log('Conectado ao mongo!')
        }).catch(function(err){
            console.log("Ocorreu erro na conexão: "+err)
        })

    //Public 
        /*Falando para o express que a pasta public que contém os arquivos estáticos*/
        //__dirname paga o caminho absoluto para a pasta public 
        app.use(express.static(path.join(__dirname, 'public')))

        //criando um MIDDLEWARES USADO PARA AUTENTICAÇÃO
        app.use(function(req, res, next){
            console.log("Eu sou um midleware!")
            //tenho que carregar este 'next' por que se não a pagina vai tracar nesta parte e ficar carregando para sempre
            next()
        })
       
/*ROTAS*/
    app.get("/", function(req, res){
        Postagem.find().populate("categoria").sort({data: "desc"}).then(function(postagens){
            res.render("index", {postagens: postagens})
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
       
    })

    app.get("/404", function(req, res){
        res.send("Erro 404!")
    })

    //essa parte fica na area inicia no botão "leia mais", isso faz com que uma postagem seja pesquisada pelo slug dela
    app.get("/postagem/:slug", function(req, res){
        Postagem.findOne({slug: req.params.slug}).then(function(postagem){
            //se ele achou uma postagem faça algo (se ele achar uma postagem eu mando ele reendenizar uma view)
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe!")
                res.redirect("/")
            }
        }).catch(function(err){
            req.flash("error?_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", function(req, res){
         Categoria.find().then(function(categorias){
            //tenho que reendenizar as categorias na pagina
            //vai reendenizar o arquivo index que esta dentro da views/categorias/index
            res.render("categorias/index", {categorias: categorias})
         }).catch(function(err){
             req.flash("error_msg", "Houve um erro interno ao listar as categorias")
             res.redirect("/")
         })
    })

    app.get("/categorias/:slug", function(req, res){

        //**************** */{slug: req.params.slug} == ache uma categoria que tenha o slug igual ao slug passado como parametro
                
        Categoria.findOne({slug: req.params.slug}).then(function(categoria){
            //agora vejo se ele achou ou não achou a categoria
            //se ele achar a categoria vou fazer outra busca pelos posts que pertencem a esta categoria
            if(categoria){
                //falo para pesquisar os posts que pertencem a esta categoria que foi passada no slug
                Postagem.find({categoria: categoria._id}).then(function(postagens){
                    //passo as postagens e a categoria
                    res.render("categorias/postagens", {postagens:postagens, categoria: categoria})
                }).catch(function(err){
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro interno ao carregar esta categoria")
            res.redirect("/")
        })
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

/*OUTROS*/
/**
 * USO ESTA PORTA PARA RODAR O SERVIDOR NO MEU PC
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando na porta 8081!")
})
 */

 //Uso essa para rodar no heroku
 //como o heroku pega uma porta aleatória eu defino process.env.PORT  para pegar essa porta qualquer
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log("Servidor rodando na porta 8081!")
})

