const DEFAULT_KEY="zubair-smart-automation:store:v1";
function browserStorage(){try{return globalThis.localStorage;}catch{return null;}}
function cleanText(value,max,label){const text=String(value??"").trim();if(!text)throw new TypeError(`${label} is required.`);if(text.length>max)throw new RangeError(`${label} is too long.`);return text;}
function validMoney(value){if(!Number.isSafeInteger(value)||value<0)throw new RangeError("Product price must be a non-negative integer in minor currency units.");return value;}
function validQuantity(value){if(!Number.isSafeInteger(value)||value<1)throw new RangeError("Quantity must be a positive integer.");return value;}
export function createStorefrontStore({storage=browserStorage(),key=DEFAULT_KEY,idFactory=()=>globalThis.crypto.randomUUID(),now=()=>new Date().toISOString()}={}){
  if(!storage||typeof storage.getItem!=="function"||typeof storage.setItem!=="function")throw new TypeError("A Storage-compatible object is required.");
  function read(){try{const value=JSON.parse(storage.getItem(key)??"{}");return {products:Array.isArray(value.products)?value.products.filter(p=>p&&typeof p.id==="string"&&typeof p.name==="string"&&Number.isSafeInteger(p.price)&&Number.isSafeInteger(p.stock)):[],cart:Array.isArray(value.cart)?value.cart.filter(i=>i&&typeof i.productId==="string"&&Number.isSafeInteger(i.quantity)&&i.quantity>0):[],orders:Array.isArray(value.orders)?value.orders.filter(o=>o&&typeof o.id==="string"):[]};}catch{return {products:[],cart:[],orders:[]};}}
  function write(state){storage.setItem(key,JSON.stringify(state));}
  function snapshot(value){return JSON.parse(JSON.stringify(value));}
  function cartView(state){const items=state.cart.map(line=>{const product=state.products.find(p=>p.id===line.productId);return product?{productId:product.id,name:product.name,unitPrice:product.price,quantity:line.quantity,lineTotal:product.price*line.quantity}:null;}).filter(Boolean);return {items,total:items.reduce((sum,item)=>sum+item.lineTotal,0)};}
  return Object.freeze({
    listProducts(){return snapshot(read().products);},
    addProduct(input={}){
      const state=read(),id=cleanText(input.id??idFactory(),80,"Product id"),name=cleanText(input.name,120,"Product name"),description=String(input.description??"").trim().slice(0,1000),price=validMoney(input.price),stock=validQuantity(input.stock);
      if(state.products.some(p=>p.id===id))throw new Error("Product id already exists.");
      const product={id,name,description,price,stock};state.products.push(product);write(state);return snapshot(product);
    },
    updateProduct(id,patch={}){
      const state=read(),index=state.products.findIndex(p=>p.id===id);if(index<0)return null;
      const current=state.products[index],next={...current};
      if(patch.name!==undefined)next.name=cleanText(patch.name,120,"Product name");
      if(patch.description!==undefined)next.description=String(patch.description).trim().slice(0,1000);
      if(patch.price!==undefined)next.price=validMoney(patch.price);
      if(patch.stock!==undefined)next.stock=validQuantity(patch.stock);
      const reserved=state.cart.find(i=>i.productId===id)?.quantity??0;if(next.stock<reserved)throw new RangeError("Stock cannot be lower than the quantity already in cart.");
      state.products[index]=next;write(state);return snapshot(next);
    },
    removeProduct(id){const state=read();const next=state.products.filter(p=>p.id!==id);if(next.length===state.products.length)return false;state.products=next;state.cart=state.cart.filter(i=>i.productId!==id);write(state);return true;},
    getCart(){return snapshot(cartView(read()));},
    addToCart(productId,quantity=1){
      validQuantity(quantity);const state=read(),product=state.products.find(p=>p.id===productId);if(!product)throw new Error("Product not found.");
      const line=state.cart.find(i=>i.productId===productId),next=(line?.quantity??0)+quantity;if(next>product.stock)throw new RangeError("Requested quantity exceeds available stock.");
      if(line)line.quantity=next;else state.cart.push({productId,quantity});write(state);return snapshot(cartView(state));
    },
    setCartQuantity(productId,quantity){
      const state=read(),line=state.cart.find(i=>i.productId===productId);if(!line)return null;
      if(quantity===0){state.cart=state.cart.filter(i=>i.productId!==productId);write(state);return snapshot(cartView(state));}
      validQuantity(quantity);const product=state.products.find(p=>p.id===productId);if(!product||quantity>product.stock)throw new RangeError("Requested quantity exceeds available stock.");
      line.quantity=quantity;write(state);return snapshot(cartView(state));
    },
    clearCart(){const state=read();state.cart=[];write(state);},
    createOrder({customerName,phone}={}){
      const state=read(),name=cleanText(customerName,120,"Customer name"),customerPhone=String(phone??"").replace(/[\s()-]/g,"");
      if(!/^\+?[0-9]{8,15}$/.test(customerPhone))throw new TypeError("A valid customer phone is required.");
      const cart=cartView(state);if(!cart.items.length)throw new Error("Cart is empty.");
      for(const line of cart.items){const product=state.products.find(p=>p.id===line.productId);if(!product||line.quantity>product.stock)throw new RangeError("Cart contains unavailable stock.");}
      const order={id:String(idFactory()),createdAt:now(),customer:{name,phone:customerPhone},items:cart.items.map(item=>({...item})),total:cart.total,currency:"EGP",status:"pending"};
      for(const line of cart.items){const product=state.products.find(p=>p.id===line.productId);product.stock-=line.quantity;}
      state.orders.unshift(order);state.cart=[];write(state);return snapshot(order);
    },
    listOrders(){return snapshot(read().orders);}
  });
}
export function buildWhatsAppOrderUrl({phone,order}={}){
  const target=String(phone??"").replace(/[\s()+-]/g,"");if(!/^[0-9]{8,15}$/.test(target))throw new TypeError("A valid WhatsApp business phone is required.");
  if(!order||!Array.isArray(order.items)||!order.items.length||!Number.isSafeInteger(order.total))throw new TypeError("A valid order is required.");
  const money=value=>`EGP ${(value/100).toFixed(2)}`;
  const lines=[`طلب رقم: ${order.id}`,...order.items.map(item=>`- ${item.name} × ${item.quantity}: ${money(item.lineTotal??item.unitPrice*item.quantity)}`),`الإجمالي: ${money(order.total)}`];
  return `https://wa.me/${target}?text=${encodeURIComponent(lines.join("\n"))}`;
}
