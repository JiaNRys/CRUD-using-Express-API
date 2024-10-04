const express = require('express')
const app = express()
const port = 4000

const mysql = require('mysql2')

app.use(express.json())

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs_api",
}).promise()


app.get('/api/users', async (req, res) => {
    try {
        const data = await pool.execute("SELECT * from 'users'")
        res.status(200).json(data[0])
    }
    catch (err) {
        res.status(500).json({ message: err})
    }
})

app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id

    try {
        const data = await pool.execute("SELECT * from users WHERE id=?", [id])
        const rows = data[0]

        if (rows.lengt === 0) {
            res.status(404).json()
        } else {
            res.status(200).json(rows[0])
        }
    }
    catch (err) {
        res.status(500).json({ message: err})
    }
})

function isValidUser(user) {
    let hasErrors = false
    const errors = {}

    if (!user.firstname) {
        errors.firstname = "The firstname is required"
        hasErrors = true
    }

    if (!user.lastname) {
        errors.lastname = "The lastname is required"
        hasErrors = true
    }
    if (!user.is_admin || isNaN(user.is_admin)) {
        errors.is_admin = "The true as 1 and false as 0 is required"
        hasErrors = true
    }
    return {hasErrors, errors}
}

app.post('/api/users', async (req, res) => {
    const user = req.body
    
    try {
        const result = isValidUser(user)

        if (result.hasErrors) {
            res.status(400).json(result.errors)
            return
        }

        let sql = 'INSERT INTO users (firstname, lastname, is_admin) VALUES (?, ?, ?)'
        let values = [user.firstname, user.lastname, user.is_admin]
        let data = await pool.execute(sql, values)

        const id = data[0].insertId

        data = await pool.execute("SELECT * FROM users WHERE id=?", [id])

        res.status(200).json(data[0][0])
    }
    catch (err) {
        res.status(500).json({ message: err})
    }
})

app.put('/api/users/:id', async (req, res) => {
    const user = req.body
    const id = req.params.id
    

    try {
        const result = isValidUser(user)

        if (result.hasErrors) {
            res.status(400).json(result.errors)
            return
        }


        let sql = 'UPDATE users SET firstname=?, lastname=?, is_admin=? WHERE id=?'
        let values = [user.firstname, user.lastname, user.is_admin, id]

        let data = await pool.execute(sql, values)

        if (data[0].effectedRows === 0) {
            res.status(400).json()
            return
        }

        data = await pool.execute("SELECT * FROM users WHERE id=?", [id])

        res.status(200).json(data[0][0])
    }
    catch (err) {
        res.status(500).json({ message: err})
    }
})

app.delete('/api/users/:id', async (req, res) => {
    const id = req.params.id
    
    try {
        const data = await pool.execute("DELETE FROM users WHERE id=?", [id])

        if (data[0].affectedRows === 0) {
            res.status(404).json
            return
        }

        res.status(200).json()
    }
    catch (err) {
        res.status(500).json({ message: err})
    }
})

app.listen(port, () => {
    console.log("Server listening on port " + port)
})