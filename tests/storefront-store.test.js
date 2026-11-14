import test from "node:test";
import assert from "node:assert/strict";
import {createStorefrontStore,buildWhatsAppOrderUrl} from "../src/core/storefront-store.js";

function makeStorage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
const product={id:"p-1",name:"حقيبة",price:12500,stock:3};

test("adds validated products and returns defensive copies",()=>{
  const store=createStorefrontStore({storage:makeStorage(),idFactory:()=>"p-1"});
  const saved=store.addProduct(product);
  assert.equal(saved.price,12500);
  saved.name="tampered";
  assert.equal(store.listProducts()[0].name,"حقيبة");
});
test("rejects invalid prices, stock and duplicate product ids",()=>{
  const store=createStorefrontStore({storage:makeStorage()});
  assert.throws(()=>store.addProduct({...product,price:-1}),/price/i);
  assert.throws(()=>store.addProduct({...product,stock:1.5}),/stock/i);
  store.addProduct(product);
  assert.throws(()=>store.addProduct(product),/exist/i);
});
test("adds cart quantities without exceeding stock and calculates integer totals",()=>{
  const store=createStorefrontStore({storage:makeStorage()});
  store.addProduct(product);
  store.addToCart("p-1",2);
  assert.equal(store.getCart().total,25000);
  assert.throws(()=>store.addToCart("p-1",2),/stock/i);
});
test("creates immutable order snapshots and deducts stock",()=>{
  const store=createStorefrontStore({storage:makeStorage(),idFactory:()=>"order-1",now:()=>"2026-11-14T12:00:00.000Z"});
  store.addProduct(product);store.addToCart("p-1",2);
  const order=store.createOrder({customerName:"عميل",phone:"01234567890"});
  assert.equal(order.total,25000);
  assert.equal(order.items[0].quantity,2);
  assert.equal(store.listProducts()[0].stock,1);
  assert.equal(store.getCart().items.length,0);
  assert.equal(store.listOrders()[0].id,"order-1");
});
test("rejects incomplete customer data and empty orders",()=>{
  const store=createStorefrontStore({storage:makeStorage()});
  assert.throws(()=>store.createOrder({customerName:"",phone:"01234567890"}),/name/i);
  store.addProduct(product);
  assert.throws(()=>store.createOrder({customerName:"عميل",phone:"01234567890"}),/cart/i);
});
test("builds WhatsApp URLs with encoded order text and validated phone",()=>{
  const url=buildWhatsAppOrderUrl({phone:"201234567890",order:{id:"o-1",items:[{name:"حقيبة",quantity:1,unitPrice:12500}],total:12500}});
  assert.match(url,/https:\/\/wa\.me\/201234567890\?/);
  assert.match(url,/\%D8/);
  assert.throws(()=>buildWhatsAppOrderUrl({phone:"abc",order:{id:"o",items:[],total:0}}),/phone/i);
});
test("recovers from malformed persisted data",()=>{
  const storage=makeStorage();storage.setItem("zubair-smart-automation:store:v1","broken");
  const store=createStorefrontStore({storage});
  assert.deepEqual(store.listProducts(),[]);
});
