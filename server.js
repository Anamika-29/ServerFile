let express = require("express");
let app = express();
const cors = require("cors");
app.use(cors());
const {Client} = require("pg");
const client = new Client({
    user: "postgres",
    password: "Emppass@29Emp",
    database: "postgres",
    port : 5432,
    host: "db.albuzhcrqgvorgolsxob.supabase.co",
    ssl:{rejectUnauthorized:false},
});
client.connect(function(res,error){
    console.log(`Connected!!!`);
});
app.use(express.json());
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Orgin","*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

const port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

app.get("/shops", function(req,res,next){
  
    let query = "Select * FROM shops";
    client.query(query,function(err,result){
        if(err) console.log(err);
        else{
            res.send(result.rows);

        }

})
});

app.post("/shops",function(req,res,next){

var values = Object.values(req.body);
 let query  = `INSERT INTO shops(name,rent) VALUES($1,$2)`;
    client.query(query,values,function(err,result){
        if(err) console.log(err);
        else {
        let query2  = "Select * FROM shops";
    client.query(query2,function(err,result2){
        if(err) console.log(err);
        else res.send(result2.rows);
    })
    }
    })
});

app.get("/products", function(req,res,next){
  
    let query = "Select * FROM products";
    client.query(query,function(err,result){
        if(err) console.log(err);
        else{
            res.send(result.rows);

        }

})
});

app.post("/products",function(req,res,next){

    var values = Object.values(req.body);
     let query  = `INSERT INTO products(productname,category,description) VALUES($1,$2,$3)`;
        client.query(query,values,function(err,result){
            if(err) console.log(err);
            else {
            let query2  = "Select * FROM products";
        client.query(query2,function(err,result2){
            if(err) console.log(err);
            else res.send(result2.rows);
        })
        }
        })
    });

    app.put("/products/:id",function(req,res,next){
        let id = +req.params.id;
        let values =[req.body.category,req.body.description,id]
        let query  = `UPDATE products SET category=$1,description=$2 WHERE productid=$3`;
        client.query(query,values,function(err,result){
            if(err) {res.status(400).send(err);}
            
            res.send('${result.rowCount} updation successful');
        
        })
    });



app.get("/purchases",function(req,res,next){
    let shop = +req.query.shop;
      let product = +req.query.product;
    let sort = req.query.sort;


        let query = "Select * FROM purchases";
        client.query(query,function(err,result){
            if(err) console.log(err);
            else {

                if(shop){
                    result.rows = result.rows.filter(st=>st.shopid===shop); 
                }
                if(product){
                    result.rows = result.rows.filter(st=>st.productid===product); 
                }
                
                if(sort==="QtyAsc"){
                    result.rows.sort((p1,p2)=>p1.quantity-p2.quantity);
                }
                        if(sort==="QtyDesc"){
                            result.rows.sort((p1,p2)=>p2.quantity-p1.quantity);
                        }
                        if(sort==="ValueAsc"){
                            result.rows.sort((p1,p2)=>p1.quantity*p1.price-p2.quantity*p2.price);
                        }
                        if(sort==="ValueDesc"){
                            result.rows.sort((p1,p2)=>p2.quantity*p2.price-p1.quantity*p1.price);
                        }
                
               
            
            res.send(result.rows);
        }
    })
})

app.get("/purchases/shops/:id", function(req,res,next){
    let id = +req.params.id;
    const query  = `Select * FROM purchases`;
    client.query(query,function(err,result){
        if(err) res.status(404).send("No Purchase found");
        else {
            let arr = result.rows.filter(ele=>ele.shopid===id);
            res.send(arr);
        }
});
});


app.get("/product/:id", function(req,res){
    let id = +req.params.id;
    const query  = `Select * FROM products`;
    client.query(query,function(err,result){
        if(err) res.status(404).send("No Data found");
        else {
            let arr = result.rows.find(ele=>ele.productid===id);
            res.send(arr);
        }
});

});


app.get("/purchases/products/:id", function(req,res){
    let id = +req.params.id;
    const query  = `Select * FROM purchases`;
    client.query(query,function(err,result){
        if(err) res.status(404).send("No Data found");
        else {
            let arr = result.rows.filter(ele=>ele.productid===id);
            res.send(arr);
        }
});
});



app.post("/purchases" , function(req,res){

    var values = Object.values(req.body);
     let query  = `INSERT INTO purchases(shopid,productid,quantity,price) VALUES($1,$2,$3,$4)`;
        client.query(query,values,function(err,result){
            if(err) console.log(err);
            else {
            let query2  = "Select * FROM purchases";
        client.query(query2,function(err,result2){
            if(err) console.log(err);
            else res.send(result2.rows);
        })
        }
        })

});
app.get("/totalPurchase/shop/:id", function(req,res){
    let id = +req.params.id;
    const query  = `Select * FROM purchases`;
    client.query(query,function(err,result){
        if(err) res.status(404).send("No Data found");
        else {
            let arr1 = result.rows.filter(ele=>ele.shopid===id);
    let arr2 = arr1.reduce((acc,curr)=>acc.find(val=>val===curr.productid) ? acc : [...acc,curr.productid],[])
    let arr3 = arr2.map(ele=>{
        let arr = arr1.filter(ele2=>ele2.productid===ele);
        let json = {productid:ele,totalPurchase:arr.reduce((acc,curr)=>acc+curr.quantity,0)}
        return json;
    });
    res.send(arr3);
}
});
});


app.get("/totalPurchase/product/:id", function(req,res){
    let id = +req.params.id;

    const query  = `Select * FROM purchases`;
    client.query(query,function(err,result){
        if(err) res.status(404).send("No Data found");
        else {
            let arr1 = result.rows.filter(ele=>ele.productid===id);
    let arr2 = arr1.reduce((acc,curr)=>acc.find(val=>val===curr.shopid) ? acc : [...acc,curr.shopid],[])
    let arr3 = arr2.map(ele=>{
        let arr = arr1.filter(ele2=>ele2.shopid===ele);
        let json = {shopid:ele,totalPurchase:arr.reduce((acc,curr)=>acc+curr.quantity,0)}
        return json;
    })
    res.send(arr3);
        }

    
});
});

  
