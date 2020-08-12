const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const {username, password} = req.body
        const db = req.app.get('db')
        let user = await db.check_user(username)
        if(user[0]){
            return res.status(400).send('Email already in use.')
        }
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)
        let newUser = await db.register_user([username, hash])
        req.session.user = newUser[0]
        delete req.session.user.password
        res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const {username, password} = req.body
        const db = req.app.get('db')
        let user = await db.check_user(username)
        if(!user[0]){
            return res.status(400).send('User not found')
        }
        const authenticate = bcrypt.compareSync(password, user[0].password)
        if(!authenticate){
            return res.status(400).send('Password Incorrect')
        }
        delete user[0].password
        console.log("BEFORE USER", req.session)
        req.session.user = user[0]
        console.log("AFTER USER", req.session)
        res.status(202).send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy()
        res.sendStatus(200)
    },
    getUser: (req, res) => {
        if(req.session.user){
            res.status(200).send(req.session.user)
        }else {
            res.status(404).send('Please Log In')
        }
    }
}