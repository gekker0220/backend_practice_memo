var express = require("express");
var router = express.Router();
const db = require("../config/mysql.js");
const conn = db.init();
const crypto = require("crypto");

/* GET users listing. */
// /users에 대한 라우트 정의
router
  .get("/", (req, res) => {
    res.send("사용자 라우트");
  })

  .post("/save", (req, res, next) => {
    const userid = req.body.userid;
    let password = req.body.password;
    password = crypto_pw(password);

    let sql_make_table = `
    CREATE TABLE memo_${userid} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userid VARCHAR(255) NOT NULL,
      memo_content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`;
    conn.query(
      "SELECT * FROM user_ids where userid = ?",
      [userid],
      (err, rows, fields) => {
        if (err) {
          console.error("error connecting: " + err.stack);
        }
        if (rows.length == 0) {
          conn.query(
            `INSERT into user_ids(userid, password) VALUES (?, ?)`,
            [userid, password],
            (err, rerult) => {
              if (err) throw err;
              conn.query(sql_make_table, (err, result) => {
                if (err) throw err;
                console.log(`유저 등록 완료`);
                return res.json({ message: 1 });
              });
            }
          );
        } else {
          console.log("중복");
          return res.json({ message: 0 });
        }
        // 쿼리 실행 완료 후 연결 종료
        // 여기서 rows를 사용하여 클라이언트에게 응답을 보낼 수 있음
      }
    );
  })

  .post("/login", (req, res) => {
    let id = req.body.userid;
    let pw = req.body.password;
    pw = crypto_pw(pw);
    conn.query(
      "select * from user_ids where userid = ? and password",
      [id, pw],
      (err, rows) => {
        if (err) throw err;
        if (rows.length != 0) {
          console.log("login");

          return res.json({
            msg: 1,
            id: id,
          });
        } else return res.json({ msg: 0 });
      }
    );
  })

  .post("/memo", (req, res) => {
    let userid = req.body.userid;
    let content = req.body.content;
    let sql = "select * from user_ids where userid = ?";
    conn.query(sql, [userid], (err, rows) => {
      if (err) throw err;
      if (rows.length != 0) {
        let sql_insert = `insert into memo_${userid} (userid, memo_content) values (?, ?)`;
        conn.query(sql_insert, [userid, content], (err, result) => {
          if (err) throw err;
          res.json({
            message: "Memo added successfully",
            content: content,
          });
        });
      } else res.json({ message: -1 });
    });
  })

  .post("/load_memo", (req, res) => {
    let userid = req.body.userid;
    let sql = `select * from memo_${userid} where userid = ?`;
    conn.query(sql, [userid], (err, rows) => {
      if (err) throw err;
      return res.json({ data: rows });
    });
  })
  .post("/remove_memo", (req, res) => {
    let userid = req.body.userid;
    let whichNumRM = req.body.whichNumRM;
    console.log(req.body);
    let sql = `DELETE FROM memo_${userid} WHERE userid = ? and id = ?`;
    conn.query(sql, [userid, whichNumRM], (err, result) => {
      if (err) throw err;
      console.log(result);
    });
  });

function crypto_pw(data) {
  const pw = data;

  // 단순히 비밀번호를 SHA-512 해시
  const hashedPassword = crypto
    .createHash("sha512")
    .update(pw)
    .digest("base64");

  console.log("해싱된 비밀번호:", hashedPassword);

  return hashedPassword;
}
module.exports = router;
