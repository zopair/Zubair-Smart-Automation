import {createStorefrontStore,buildWhatsAppOrderUrl} from "../core/storefront-store.js";
export function mountMiniStore(root){
  let store;try{store=createStorefrontStore();}catch{const note=document.createElement("p");note.className="storage-note";note.textContent="التخزين المحلي غير متاح في هذا المتصفح.";root.replaceChildren(note);return;}
  const section=document.createElement("section");section.className="mini-store";
  const heading=document.createElement("h3");heading.textContent="إدارة المتجر والمنتجات";
  const productForm=document.createElement("form");productForm.className="store-form";
  const name=field("text","اسم المنتج","name",120),price=field("number","السعر بالجنيه","price"),stock=field("number","الكمية المتاحة","stock");
  price.min="0.01";price.step="0.01";stock.min="0";stock.step="1";
  const add=document.createElement("button");add.type="submit";add.className="primary-button";add.textContent="إضافة المنتج";
  productForm.append(name,price,stock,add);
  const products=document.createElement("div");products.className="store-products";
  const cartTitle=document.createElement("h3");cartTitle.textContent="سلة الشراء";
  const cart=document.createElement("div");cart.className="store-cart";
  const ordersTitle=document.createElement("h3");ordersTitle.textContent="سجل الطلبات";
  const orders=document.createElement("div");orders.className="store-orders";
  const checkout=document.createElement("form");checkout.className="store-form checkout-form";
  const customer=field("text","اسم العميل","customer",120),phone=field("tel","هاتف العميل","phone",20),business=field("tel","رقم واتساب المتجر الدولي","business",20);
  business.placeholder="مثال: 2010XXXXXXXX";
  const submit=document.createElement("button");submit.type="submit";submit.className="primary-button";submit.textContent="تجهيز الطلب عبر واتساب";
  checkout.append(customer,phone,business,submit);
  const status=document.createElement("p");status.className="storage-note";status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.textContent="الأسعار بالجنيه المصري، وتُحفظ بيانات المتجر محلياً على هذا الجهاز.";
  function field(type,placeholder,id,max){const input=document.createElement("input");input.type=type;input.name=id;input.placeholder=placeholder;input.setAttribute("aria-label",placeholder);if(max)input.maxLength=max;input.required=true;return input;}
  function render(){
    products.replaceChildren();const list=store.listProducts();
    if(!list.length){const empty=document.createElement("p");empty.className="empty-state";empty.textContent="أضف أول منتج لبدء متجرك.";products.append(empty);}
    for(const product of list){const card=document.createElement("article");card.className="store-product";const title=document.createElement("strong");title.textContent=product.name;const detail=document.createElement("span");detail.textContent=` ${(product.price/100).toFixed(2)} جنيه · المتاح ${product.stock}`;const buy=document.createElement("button");buy.type="button";buy.textContent="أضف للسلة";buy.disabled=product.stock<1;buy.addEventListener("click",()=>{try{store.addToCart(product.id);status.textContent="تمت إضافة المنتج إلى السلة.";render();}catch(error){status.textContent=error.message;}});const remove=document.createElement("button");remove.type="button";remove.className="remove-task";remove.textContent="حذف";remove.addEventListener("click",()=>{store.removeProduct(product.id);render();});card.append(title,detail,buy,remove);products.append(card);}
    const value=store.getCart();cart.replaceChildren();for(const item of value.items){const line=document.createElement("p");line.textContent=`${item.name} × ${item.quantity} — ${(item.lineTotal/100).toFixed(2)} جنيه`;cart.append(line);}const total=document.createElement("strong");total.textContent=`الإجمالي: ${(value.total/100).toFixed(2)} جنيه`;cart.append(total);
    orders.replaceChildren();const history=store.listOrders();if(!history.length){const empty=document.createElement("p");empty.className="empty-state";empty.textContent="لا توجد طلبات مسجلة بعد.";orders.append(empty);}for(const order of history){const row=document.createElement("article");row.className="store-order";const summary=document.createElement("span");summary.textContent=`${order.customer.name} · ${order.items.length} منتج · ${(order.total/100).toFixed(2)} جنيه`;const reference=document.createElement("small");reference.textContent=order.id;row.append(summary,reference);orders.append(row);}
  }
  productForm.addEventListener("submit",event=>{event.preventDefault();try{store.addProduct({name:name.value,price:Math.round(Number(price.value)*100),stock:Number(stock.value)});productForm.reset();status.textContent="تم حفظ المنتج.";render();}catch(error){status.textContent=error.message;}});
  checkout.addEventListener("submit",event=>{event.preventDefault();try{const businessPhone=business.value.replace(/[\\s()+-]/g,"");if(!/^[0-9]{8,15}$/.test(businessPhone))throw new TypeError("أدخل رقم واتساب المتجر بصيغة دولية صحيحة قبل إنشاء الطلب.");const order=store.createOrder({customerName:customer.value,phone:phone.value});const url=buildWhatsAppOrderUrl({phone:businessPhone,order});status.textContent="تم إنشاء الطلب محلياً. افتح واتساب لإرساله إلى المتجر.";const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="فتح رسالة الطلب في واتساب";link.className="store-whatsapp-link";const previous=section.querySelector(".store-whatsapp-link");previous?.remove();status.after(link);render();}catch(error){status.textContent=error.message;}});
  section.append(heading,productForm,products,cartTitle,cart,checkout,status,ordersTitle,orders);root.replaceChildren(section);render();
}
