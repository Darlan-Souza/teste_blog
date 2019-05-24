/*GUARDA TODAS AS ROTAS DE ADMIN*/
const express = require('express')
//Router() é usado para criar rotas em arquivos separados
const router = express.Router()

/*USANDO UM MODEL DE FORMA EXTERNA DENTRO DO MONGOOSE*/
//importa o mongoose
const mongoose = require('mongoose')
//chama o arquivo do model
require('../models/Categoria')
require('../models/Postagem')

//Passa a referencia do model para uma variável
//pego o 'categorias' de mongoose.model("categorias", Categoria)
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")

//carrego o helper que é usado para dar permissão de acesso apenas ao admin
//{eAdmin} quer dizer que de dentro da função ../helpers/eAdmin/eadmin eu quero pegar apenas o objeto eAdmin

//AGORA PARA CVADA ROTA QUE EU QUISER PROTEGAR VOU COLAR "eAdim" NO CABEÇALHO 
//ex: router.post('/categorias/nova', function (req, res) não pode ser acessada por um usuário comum
//então coloca o "eAdmin" e ela é bloquada para usuários que tenham o eAdmin=0 no banco
//portanto router.post('/categorias/nova', function (req, res) fica router.post('/categorias/nova',eAdmin, function (req, res)
const {eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, function (req, res) {
    res.render('admin/index')
})

router.get('/posts', eAdmin, function (req, res) {
    res.send('Pagina de posts')
})

router.get('/categorias', eAdmin, function (req, res) {
    /*LISTANDO AS CATEGORIAS com o find()*/
    /*sort({date: 'desc'}) = vai listar as categorias pela que foi criada mais recente*/
    Categoria.find().sort({ date: 'desc' }).then(function (categorias) {
        res.render("admin/categorias", { categorias: categorias })
    }).catch(function (err) {
        res.flash('error_msg', 'Houve um erro ao listar as categorias: ')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, function (req, res) {
    res.render("admin/addcategorias");
})

router.post('/categorias/nova', eAdmin, function (req, res) {

    var erros = []
    //criando mensagens de erro na validação da categoria
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome da categoria é muito pequeno' })
    }

    //se existirem mais de um erro(SE O TAMANHO DO ARRAY FOR MAIOR QUE 0 É QUE TEVE ALGUM ERRO)
    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        /*CRIA A NOVA CATEGORIA NO BD*/
        const novaCategoria = {
            //esses campos fazem referencia a views/admin/addcategorias => neme="nome", name="slug"
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(function () {
            /*PEGO A MSG DE ERRO LÁ DE APP.JS*/
            req.flash('success_msg', "Categoria criada com sucesso!")
            /*DIRECINO PARA A PÁGINA DE LISTAGEM DE CATEGORIAS*/
            res.redirect("/admin/categorias")
        }).catch(function (err) {
            req.flash('error_msg', "Erro na criação da categoria, tente novamente!")
            res.redirect('/admin')
        })
    }

})

router.get('/categorias/edit/:id', eAdmin, function (req, res) {
    /*PARA PREENCHER O FORMULÁRIO DE EDITCATEGORIAS FAÇO A SEGUINTE OPERAÇÃO*/
    /*findOne por que ele vai pesquisar apenas 1 registro no bd
    findOne({_id: req.body.id}) assim eu faço um 'where' no id que está sendo passado como paramentro*/
    Categoria.findOne({ _id: req.params.id }).then(function (categoria) {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch(function (err) {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
})
//ESTA ROTA É DO TIPO POST

/***********DEPOIS CRIAR O SISTEMA DE VALIDAÇÃO DA EDIÇÃO************/
router.post('/categorias/edit', eAdmin, function (req, res) {
    Categoria.findOne({ _id: req.body.id }).then(function (categoria) {
        //Isso que dizer que ele vai pegar o campo 'nome' da categoria que queremos editar e vai atribuir a este campo o valor que esta vindo do formulário de edição
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(function () {
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch(function (err) {
            req.flash('error_msg', 'Houve um erro interno ao salvar a categoria')
            res.redirect('/admin/categorias')
        })

    }).catch(function (err) {
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', eAdmin, function (req, res) {
    //vai remover a categoria que tenha o id igual ao id quer vem do formulário categorias.handlebars
    Categoria.remove({ _id: req.body.id }).then(function () {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch(function (err) {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, function (req, res) {
    //O populate faz com que toda vez que eu pesa para o mongo tr5azer informações das postagens pra mim ele também irá trazer informações da categoria da postagem
    //populate("categoria")  esse "categoria" é o nome do campo no model
    Postagem.find().populate("categoria").sort({ data: "desc" }).then(function (postagens) {
        res.render('admin/postagens', { postagens: postagens })
    }).catch(function (err) {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, function (req, res) {
    Categoria.find().then(function (categorias) {
        res.render('admin/addpostagem', { categorias: categorias })
    }).catch(function (err) {
        req.flash("error_msg", "Houve um erro ao carregar o formulário!")
        res.redirect("/admin")
    })
})

//falta criar a validação aqui
router.post('/postagens/nova', eAdmin, function (req, res) {
    var erros = [];

    if (req.body.categoria == 0) {
        erros.push({ texto: "Categoria invalida registre uma categoria" })
    }

    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
        //para adcionar a postagem crio uma funcção que recebe um objeto que esta sendo passado através do formulário
        var novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
    }

    new Postagem(novaPostagem).save().then(function () {
        req.flash("success_msg", "Postagem criada com sucesso")
        res.redirect("/admin/postagens")
    }).catch(function (err) {
        req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
        res.redirect("/admin/postagens")

    })

})

router.get("/postagens/edit/:id", eAdmin, function (req, res) {

    //FAZER BUSCAR EM SEGUIDA 
    //vai pesquisar uma postagem que tenha o id igual ao id passado por parametro

    //PRIMEIRO PESQUISO POR UMA POSTAGEM PARA DEPOIS PESQUISAR POR UMA CATEGORIA
    Postagem.findOne({ _id: req.params.id }).then(function (postagem) {

        Categoria.find().then(function (categorias) {
            res.render('admin/editpostagens', { categorias: categorias, postagem: postagem })

        }).catch(function (err) {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })


    }).catch(function (err) {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })

})

//fazer a validação
router.post("/postagem/edit", eAdmin, function (req, res) {
    //neste caso usamos o .body por que pego o valor do formulário de editpostagens com campo name="id"
    //pesquisamos uma postagem que tenha o id igual ao id passado pelo formulario
    Postagem.findOne({ _id: req.body.id }).then(function (postagem) {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(function () {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch(function (err) {
            req.flash('error_msg', 'Houve um erro interno ao salvar a postagem')
            res.redirect('/admin/postagens')
        })

    }).catch(function (err) {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

//forma menos segura de edição além da edição por formulários
router.get("/postagens/deletar/:id", eAdmin, function (req, res) {
    Postagem.remove({ _id: req.params.id }).then(function () {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch(function (err) {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

module.exports = router