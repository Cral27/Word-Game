const express = require("express");
const app = express();
const session = require('express-session');
const server = app.listen(1337, function(){
    console.log('Listening on port 1337');
});

// more new code:
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))


const io = require('socket.io')(server);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/static"));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
//copy until this line

app.get('/', function(req, res){
    res.render('index');
})

let charName;
let word;
let wordPuzzle;

function puzzle()
{
    let rando = Math.floor(Math.random()*6);
    let data = ['rocket', 'socket', 'docker', 'nagger', 'bucket', 'jogger'];
    if(rando)
    {
        word = data[rando];
        wordPuzzle = word.split('');

        for (let i = 0; i < wordPuzzle.length; i++) {
            wordPuzzle[i] = '_';
        }

        // Revealing two random letters
        let rando1 = Math.floor(Math.random() * wordPuzzle.length);
        let rando2 = Math.floor(Math.random() * wordPuzzle.length);
        while (rando1 === rando2) {
            rando2 = Math.floor(Math.random() * wordPuzzle.length);
        }
        wordPuzzle[rando1] = word[rando1];
        wordPuzzle[rando2] = word[rando2];

    }
}

app.post('/chatroom', function(req, res){
    charName = req.body.name;
    if(charName){
        // if (!req.session.wordPuzzle) {
        //     puzzle();
        //     req.session.wordPuzzle = wordPuzzle;
        //     req.session.actualWord = word;
        // } else {
        //     wordPuzzle = req.session.wordPuzzle;
        //     word = req.session.actualWord;
        // }
        if(!wordPuzzle){
            puzzle();
        }
        res.render('chatroom', {name: charName, puzzle: wordPuzzle, actualWord: word});
    }else{
        res.redirect('/');
    }
})

io.on('connection', function(socket){
    socket.on('beta', function(data){
        charName = data.name;
        // Redirect to the chatroom route with charName as a query parameter
        console.log(data);
        io.emit('beta', {name: charName, msg: data.msg});
    });
});


