import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const meals = [
  { id:'r1', name:'Chicken Khichuri Bowl', category:'Regular Meal', price:180, rating:4.8, reviews:126, emoji:'🍲', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80', desc:'Homestyle khichuri with tender chicken, egg and salad.' },
  { id:'r2', name:'Beef Tehari Set', category:'Regular Meal', price:240, rating:4.9, reviews:94, emoji:'🍛', image:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80', desc:'Fragrant tehari rice with slow-cooked beef and cucumber salad.' },
  { id:'r3', name:'Rice, Dal & Chicken Curry', category:'Regular Meal', price:210, rating:4.7, reviews:81, emoji:'🍗', image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80', desc:'Steamed rice, thick dal, chicken curry and seasonal vegetables.' },
  { id:'h1', name:'Grilled Chicken Protein Box', category:'Healthy Meal', price:280, rating:4.9, reviews:72, emoji:'🥗', image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80', desc:'Grilled chicken, brown rice, vegetables and boiled egg.' },
  { id:'h2', name:'Egg & Chicken Fitness Bowl', category:'Healthy Meal', price:250, rating:4.8, reviews:55, emoji:'🥚', image:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80', desc:'High-protein chicken, eggs, greens, cucumber and light dressing.' },
  { id:'h3', name:'Fish & Veggie Lean Plate', category:'Healthy Meal', price:300, rating:4.7, reviews:48, emoji:'🐟', image:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80', desc:'Grilled fish, mixed vegetables and controlled rice portion.' },
  { id:'c1', name:'Chocolate Fudge Cake Slice', category:'Cake & Pastry', price:120, rating:4.9, reviews:133, emoji:'🍰', image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80', desc:'Soft homemade chocolate cake with rich fudge topping.' },
  { id:'c2', name:'Chicken Puff Pastry', category:'Cake & Pastry', price:90, rating:4.6, reviews:61, emoji:'🥐', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', desc:'Crispy baked pastry filled with mildly spiced chicken.' },
  { id:'c3', name:'Red Velvet Cupcake', category:'Cake & Pastry', price:110, rating:4.8, reviews:79, emoji:'🧁', image:'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=900&q=80', desc:'Fresh red velvet cupcake with smooth cream-cheese frosting.' }
];

const addons = [
  { name:'Extra Rice', price:40, emoji:'🍚' },
  { name:'Water', price:20, emoji:'💧' },
  { name:'Cutlery Set', price:10, emoji:'🍴' }
];

const packages = [
  { name:'Single Order', days:1, discount:0, desc:'Perfect for trying a meal today.' },
  { name:'3-Day Package', days:3, discount:5, desc:'3 selected meal days with 5% package savings.' },
  { name:'7-Day Package', days:7, discount:10, desc:'Weekly student meal plan with 10% package savings.' }
];

function App(){
  const [view, setView] = useState('home');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [packagePlan, setPackagePlan] = useState(packages[0]);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('12:00 PM - 1:00 PM');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('campusbite_user') || 'null'));
  const [authMode, setAuthMode] = useState('signup');
  const [form, setForm] = useState({fullName:'', studentId:'', email:'', department:'', phone:'', password:'', identifier:''});

  const visibleMeals = category === 'All' ? meals : meals.filter(m => m.category === category);
  const itemSubtotal = useMemo(() => Object.entries(cart).reduce((sum,[id,q]) => sum + (meals.find(m=>m.id===id)?.price || 0)*q, 0), [cart]);
  const addonSubtotal = useMemo(() => Object.entries(selectedAddons).reduce((sum,[name,q]) => sum + (addons.find(a=>a.name===name)?.price || 0)*q, 0), [selectedAddons]);
  const baseTotal = itemSubtotal + addonSubtotal;
  const discount = Math.round(baseTotal * packagePlan.discount / 100);
  const total = baseTotal - discount;
  const itemCount = Object.values(cart).reduce((a,b)=>a+b,0);

  const changeQty = (id, delta) => setCart(prev => {
    const next = Math.max(0, (prev[id] || 0) + delta);
    const copy = {...prev};
    if(next === 0) delete copy[id]; else copy[id] = next;
    return copy;
  });
  const changeAddon = (name, delta) => setSelectedAddons(prev => {
    const next = Math.max(0, (prev[name] || 0) + delta);
    const copy={...prev};
    if(next===0) delete copy[name]; else copy[name]=next;
    return copy;
  });

  async function handleAuth(e){
    e.preventDefault(); setMessage('');
    try{
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const body = authMode === 'signup'
        ? {fullName:form.fullName,studentId:form.studentId,email:form.email,department:form.department,phone:form.phone,password:form.password}
        : {identifier:form.identifier,password:form.password};
      const res = await fetch(API+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Something went wrong');
      localStorage.setItem('campusbite_token', data.token);
      localStorage.setItem('campusbite_user', JSON.stringify(data.user));
      setUser(data.user); setView('menu'); setMessage(data.message);
    }catch(err){ setMessage(err.message); }
  }

  async function submitOrder(){
    setMessage('');
    if(!user){ setView('auth'); setMessage('Please login before placing your order.'); return; }
    if(itemCount===0){ setMessage('Please add at least one meal.'); return; }
    if(!pickupDate){ setMessage('Please select a pickup date.'); return; }
    const token = localStorage.getItem('campusbite_token');
    const items = Object.entries(cart).map(([id,quantity]) => { const m=meals.find(x=>x.id===id); return {mealId:id,name:m.name,category:m.category,price:m.price,quantity}; });
    const selected = Object.entries(selectedAddons).map(([name,quantity]) => ({name,price:addons.find(a=>a.name===name).price,quantity}));
    try{
      const res = await fetch(API+'/orders',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({items,addons:selected,packagePlan:packagePlan.name,pickupDate,pickupSlot,note,totalAmount:total})});
      const data=await res.json(); if(!res.ok) throw new Error(data.message || 'Order failed');
      setMessage(`Order placed! Total: ৳${total}. Status: Pending`); setCart({}); setSelectedAddons({});
    }catch(err){ setMessage(err.message); }
  }

  function logout(){ localStorage.removeItem('campusbite_token'); localStorage.removeItem('campusbite_user'); setUser(null); setView('home'); }

  const minDate = new Date(Date.now()+86400000).toISOString().slice(0,10);
  const maxDate = new Date(Date.now()+8*86400000).toISOString().slice(0,10);

  return <>
    <header className="nav">
      <button className="brand" onClick={()=>setView('home')}><span>CB</span><div>CampusBite<small>Home-cooked. Campus-ready.</small></div></button>
      <nav>
        <button onClick={()=>setView('home')}>Home</button>
        <button onClick={()=>setView('menu')}>Menu</button>
        <button onClick={()=>setView('packages')}>Packages</button>
      </nav>
      <div className="nav-actions">
        {user ? <><span className="hello">Hi, {user.fullName?.split(' ')[0]}</span><button className="outline" onClick={logout}>Logout</button></> : <button className="outline" onClick={()=>setView('auth')}>Login / Sign up</button>}
        <button className="cart-btn" onClick={()=>setView('checkout')}>🛒 <b>{itemCount}</b></button>
      </div>
    </header>

    {message && <div className="toast" onClick={()=>setMessage('')}>{message} <span>×</span></div>}

    {view==='home' && <main>
      <section className="hero">
        <div className="hero-copy"><div className="pill">🎓 Made by students, for students</div><h1>Homemade food,<br/><em>right on campus.</em></h1><p>Order fresh meals made by your university friends. From comforting Bangladeshi set menus to gym-friendly protein bowls and homemade pastries.</p><div className="hero-actions"><button className="primary" onClick={()=>setView('menu')}>Explore today's menu →</button><button className="ghost" onClick={()=>setView('packages')}>View meal packages</button></div><div className="stats"><div><b>4.8★</b><span>Student rating</span></div><div><b>100+</b><span>Meals served</span></div><div><b>Fresh</b><span>Made daily</span></div></div></div>
        <div className="hero-art"><div className="plate">🍛</div><div className="float-card fc1">🥗 <b>Healthy meals</b><small>from ৳250</small></div><div className="float-card fc2">✨ <b>Freshly made</b><small>by campus cooks</small></div></div>
      </section>
      <section className="how"><span>HOW IT WORKS</span><h2>Your lunch in three easy steps</h2><div className="steps"><div><b>01</b><h3>Choose your meal</h3><p>Browse regular, healthy, cake and pastry options.</p></div><div><b>02</b><h3>Pick your day</h3><p>Select a convenient date and pickup time for next week.</p></div><div><b>03</b><h3>Collect & enjoy</h3><p>Pick up fresh homemade food at your campus point.</p></div></div></section>
    </main>}

    {view==='auth' && <main className="auth-page"><section className="auth-info"><div className="pill">🍴 CAMPUS FOOD COMMUNITY</div><h1>Good food tastes better when it's made by a friend.</h1><p>Create your student account to pre-order fresh homemade meals, save your details and manage upcoming campus lunches.</p><div className="benefits"><div>✓ University ID-based student account</div><div>✓ Secure password storage</div><div>✓ Flexible pickup scheduling</div><div>✓ Weekly meal packages</div></div></section><section className="auth-card"><div className="tabs"><button className={authMode==='signup'?'active':''} onClick={()=>setAuthMode('signup')}>Sign up</button><button className={authMode==='login'?'active':''} onClick={()=>setAuthMode('login')}>Login</button></div><h2>{authMode==='signup'?'Create your account':'Welcome back'}</h2><p>{authMode==='signup'?'Use your university information to join.':'Login with university email or student ID.'}</p><form onSubmit={handleAuth}>{authMode==='signup' ? <><div className="two"><label>Full name<input required placeholder="e.g. Muntasir Rahman" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></label><label>Student ID<input required placeholder="e.g. 22101234" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}/></label></div><label>University email<input required type="email" placeholder="name@university.edu" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><div className="two"><label>Department<input required placeholder="CSE / EEE / BBA" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></label><label>Phone number<input required placeholder="01XXXXXXXXX" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div></> : <label>Email or Student ID<input required placeholder="Email or ID" value={form.identifier} onChange={e=>setForm({...form,identifier:e.target.value})}/></label>}<label>Password<input required minLength="6" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="primary full" type="submit">{authMode==='signup'?'Create student account →':'Login →'}</button></form><small className="privacy">🔒 Your password is hashed before being stored.</small></section></main>}

    {view==='menu' && <main className="content"><div className="section-head"><div><span>FRESH THIS WEEK</span><h1>Choose your meal</h1><p>Homemade in small batches. Order ahead so nothing goes to waste.</p></div><button className="primary" onClick={()=>setView('checkout')}>Review order ({itemCount}) →</button></div><div className="filters">{['All','Regular Meal','Healthy Meal','Cake & Pastry'].map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="meal-grid">{visibleMeals.map(m=><article className="meal-card" key={m.id}><div className="meal-img" style={{backgroundImage:`url(${m.image})`}}><i>{m.category}</i></div><div className="meal-body"><div className="rating">★ {m.rating} <small>({m.reviews} reviews)</small></div><h3>{m.name}</h3><p>{m.desc}</p><div className="meal-foot"><strong>৳{m.price}</strong>{cart[m.id] ? <div className="qty"><button onClick={()=>changeQty(m.id,-1)}>−</button><b>{cart[m.id]}</b><button onClick={()=>changeQty(m.id,1)}>+</button></div> : <button className="add" onClick={()=>changeQty(m.id,1)}>+ Add</button>}</div></div></article>)}</div></main>}

    {view==='packages' && <main className="content"><div className="section-head"><div><span>PLAN AHEAD & SAVE</span><h1>Student meal packages</h1><p>Choose a package now; select meals and pickup day from the menu.</p></div></div><div className="package-grid">{packages.map((p,i)=><article className={`package ${packagePlan.name===p.name?'selected':''}`} key={p.name} onClick={()=>setPackagePlan(p)}>{i===2&&<div className="popular">MOST POPULAR</div>}<div className="package-icon">{i===0?'🍽️':i===1?'📅':'🎒'}</div><h2>{p.name}</h2><p>{p.desc}</p><strong>{p.discount?`${p.discount}% OFF`:'Pay per order'}</strong><button>{packagePlan.name===p.name?'✓ Selected':'Select package'}</button></article>)}</div><div className="package-note"><b>How packages work:</b> This starter version records your selected package with the order and applies the displayed discount. Later you can extend it to create multiple scheduled delivery dates automatically.</div></main>}

    {view==='checkout' && <main className="content checkout"><div className="section-head"><div><span>FINAL STEP</span><h1>Review & schedule</h1><p>Choose extras and tell us when you want to collect your food.</p></div></div><div className="checkout-grid"><section><div className="panel"><h2>Your meals</h2>{itemCount===0?<div className="empty">Your basket is empty. <button onClick={()=>setView('menu')}>Browse menu</button></div>:Object.entries(cart).map(([id,q])=>{const m=meals.find(x=>x.id===id);return <div className="line" key={id}><div><b>{m.emoji} {m.name}</b><small>৳{m.price} each</small></div><div className="qty"><button onClick={()=>changeQty(id,-1)}>−</button><b>{q}</b><button onClick={()=>changeQty(id,1)}>+</button></div><strong>৳{m.price*q}</strong></div>})}</div><div className="panel"><h2>Add extras</h2>{addons.map(a=><div className="addon" key={a.name}><div><b>{a.emoji} {a.name}</b><small>+ ৳{a.price}</small></div><div className="qty"><button onClick={()=>changeAddon(a.name,-1)}>−</button><b>{selectedAddons[a.name]||0}</b><button onClick={()=>changeAddon(a.name,1)}>+</button></div></div>)}</div><div className="panel"><h2>Pickup details</h2><div className="two"><label>Date<input type="date" min={minDate} max={maxDate} value={pickupDate} onChange={e=>setPickupDate(e.target.value)}/></label><label>Time<select value={pickupSlot} onChange={e=>setPickupSlot(e.target.value)}><option>12:00 PM - 1:00 PM</option><option>1:00 PM - 2:00 PM</option><option>2:00 PM - 3:00 PM</option><option>5:00 PM - 6:00 PM</option></select></label></div><label>Special note<textarea placeholder="Less spicy, allergy note, pickup instruction..." value={note} onChange={e=>setNote(e.target.value)}/></label></div></section><aside className="summary"><h2>Order summary</h2><div className="summary-package"><span>Package</span><select value={packagePlan.name} onChange={e=>setPackagePlan(packages.find(p=>p.name===e.target.value))}>{packages.map(p=><option key={p.name}>{p.name}</option>)}</select></div><div className="sum-line"><span>Meals & extras</span><b>৳{baseTotal}</b></div>{discount>0&&<div className="sum-line saving"><span>Package discount ({packagePlan.discount}%)</span><b>- ৳{discount}</b></div>}<hr/><div className="grand"><span>Total</span><strong>৳{total}</strong></div><p>Payment method can be added later. For this test version, the order is saved as <b>Pending</b>.</p><button className="primary full" onClick={submitOrder}>Submit order →</button>{!user&&<small>Login is required before submission.</small>}</aside></div></main>}

    <footer><div><b>CampusBite</b><span>Student-made food, made with care.</span></div><small>Demo MERN project • Prices in BDT • Built for learning & testing</small></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
