/* Browser-only deterministic SDK boundary. No network or real Supabase project. */
(function () {
  'use strict';
  const key = 'bb.test.supabase';
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) {}
  const state = saved || { user: null, tables: {study_state:[],quiz_states:[],notes:[]}, calls:[], offline:false };
  const listeners = [];
  const failures = [];
  const delays = {};
  let held = [];
  const users = {
    a: {id:'11111111-1111-4111-8111-111111111111',email:'ana@example.test'},
    b: {id:'22222222-2222-4222-8222-222222222222',email:'bogdan@example.test'}
  };
  const persist = () => { try { sessionStorage.setItem(key,JSON.stringify(state)); } catch (_) {} };
  const session = () => state.user ? {user:clone(state.user),access_token:'test-only-token',refresh_token:'test-only-refresh',expires_at:4102444800} : null;
  const emit = event => listeners.slice().forEach(callback => callback(event,session()));
  const record = (operation,table,payload) => {state.calls.push({operation,table,payload:clone(payload)});persist();};
  async function request(operation,table,action) {
    const failureIndex = failures.findIndex(f => (!f.operation || f.operation===operation) && (!f.table || f.table===table));
    const failure = failureIndex < 0 ? null : failures.splice(failureIndex,1)[0];
    const result = state.offline || !navigator.onLine
      ? {data:null,error:{message:'mock network secret-like detail must never render',code:'NETWORK'}}
      : failure ? {data:null,error:{message:'mock database detail must never render',code:failure.code||'42501'}} : action();
    const delay = delays[operation+':'+table] || delays[operation] || 0;
    if(delay === 'hold') await new Promise(resolve => held.push(resolve));
    else if(delay) await new Promise(resolve => setTimeout(resolve,delay));
    return clone(result);
  }
  const auth = {
    async getSession() { record('getSession');return {data:{session:session()},error:null}; },
    onAuthStateChange(callback) {listeners.push(callback);return {data:{subscription:{unsubscribe(){const i=listeners.indexOf(callback);if(i>=0)listeners.splice(i,1);}}}};},
    async signInWithPassword({email}) {
      record('signInWithPassword',null,{email});
      return request('auth',null,() => {state.user=clone(email.toLowerCase()===users.b.email?users.b:users.a);persist();queueMicrotask(()=>emit('SIGNED_IN'));return {data:{user:state.user,session:session()},error:null};});
    },
    async signUp({email,options}) {
      record('signUp',null,{email,options});
      return request('auth',null,()=> {const user=clone(email.toLowerCase()===users.b.email?users.b:users.a);if(state.confirmEmail)return {data:{user,session:null},error:null};state.user=user;persist();queueMicrotask(()=>emit('SIGNED_IN'));return {data:{user:state.user,session:session()},error:null};});
    },
    async signOut() {record('signOut');state.user=null;persist();emit('SIGNED_OUT');return {error:null};},
    async resetPasswordForEmail(email,options) {record('resetPasswordForEmail',null,{email,options});return request('auth',null,()=>({data:{},error:null}));},
    async updateUser(attributes) {record('updateUser',null,{hasPassword:typeof attributes.password==='string'});return request('auth',null,()=>({data:{user:state.user},error:null}));}
  };
  const sdk = {auth,from(table) {
    return {
      select() {return {eq(column,value) {
        record('select',table,{column,value});
        return request('select',table,() => {
          if(!state.user || column!=='user_id' || value!==state.user.id) return {data:null,error:{code:'42501',message:'mock RLS denial'}};
          return {data:clone((state.tables[table]||[]).filter(row=>row.user_id===value)),error:null};
        });
      }};},
      upsert(input,options) {
        record('upsert',table,{input,options});
        return request('upsert',table,() => {
          const rows = Array.isArray(input)?input:[input];
          if(rows.some(row=>!state.user || row.user_id!==state.user.id)) return {data:null,error:{code:'42501',message:'mock RLS denial'}};
          const keys = (options?.onConflict || 'user_id').split(',');
          for(const row of rows) {
            const existing = state.tables[table].findIndex(value=>keys.every(field=>value[field]===row[field]));
            const normalized={...clone(row),updated_at:new Date().toISOString()};
            if(table==='notes')normalized.created_at=state.tables[table][existing]?.created_at || new Date().toISOString();
            if(existing<0)state.tables[table].push(normalized);else state.tables[table][existing]=normalized;
          }
          persist();return {data:clone(rows),error:null};
        });
      }
    };
  }};
  window.__mock = {
    users,
    seed(table,rows) {state.tables[table]=clone(rows);persist();},
    rows(table) {return clone(state.tables[table]);},
    calls() {return clone(state.calls);},
    clearCalls() {state.calls=[];persist();},
    requireConfirmation(value) {state.confirmEmail=value;persist();},
    failNext(operation,table,code) {failures.push({operation,table,code});},
    delay(operation,table,ms) {delays[table?operation+':'+table:operation]=ms;},
    release() {const pending=held;held=[];pending.forEach(resolve=>resolve());},
    offline(value) {state.offline=value;persist();Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>!state.offline});window.dispatchEvent(new Event(value?'offline':'online'));},
    setUser(name,event='SIGNED_IN') {state.user=name?clone(users[name]):null;persist();emit(event);},
    recovery() {emit('PASSWORD_RECOVERY');}
  };
  Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>!state.offline});
  window.BBSupabaseFactory = () => sdk;
})();
