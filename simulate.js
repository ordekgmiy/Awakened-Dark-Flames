// weightedRandom
function weightedRandom(values, probs) {
  let r = Math.random(), acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r <= acc) return values[i];
  }
  return values[values.length - 1];
}

// calcStats
function calcStats(arr) {
  const sorted = [...arr].sort((a,b)=>a-b);
  const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
  const mid = sorted[Math.floor(arr.length/2)];
  const std = Math.sqrt(arr.map(x => (x-avg)**2).reduce((a,b)=>a+b,0)/arr.length);
  return { avg, mid, std, sorted };
}

// ===== 預設 armorPool =====
let armorPool = data250;

// ===== 裝備等級切換 select =====
document.getElementById("equipLevel").addEventListener("change", function(){
  armorPool = this.value === "160" ? data160 : data250;
});

// ===== 模擬函式 =====
function simulate() {
  const target = parseFloat(document.getElementById("targetMain").value);
  const oneAll = parseFloat(document.getElementById("oneAll").value);
  const secStat = parseFloat(document.getElementById("secStat").value);
  const oneMA = parseFloat(document.getElementById("oneMA").value);
  const simCount = parseInt(document.getElementById("simCount").value);

  let attemptsArr = [];
  let eqValues = [];
  let logs = [];

  for(let i=0;i<simCount;i++){
    let attempts=0;
    while(true){
      attempts++;
      const selected = [...armorPool].sort(()=>Math.random()-0.5).slice(0,4);

      // 初始化所有屬性
      let STR=0, DEX=0, INT=0, LUK=0, ALL=0, MA=0;
      let DEF=0, HP=0, MP=0, MS=0, Jump=0, LvMinus=0;

      selected.forEach(s=>{
        let v = weightedRandom(s.value, s.prob);
        if(s.name.includes("+")){
          const [a,b] = s.name.split("+");
          if(a==="力量") STR+=v; if(a==="敏捷") DEX+=v; if(a==="智力") INT+=v; if(a==="幸運") LUK+=v;
          if(b==="力量") STR+=v; if(b==="敏捷") DEX+=v; if(b==="智力") INT+=v; if(b==="幸運") LUK+=v;
        } else {
          if(s.name==="力量") STR+=v;
          if(s.name==="敏捷") DEX+=v;
          if(s.name==="智力") INT+=v;
          if(s.name==="幸運") LUK+=v;
          if(s.name==="魔法攻擊力") MA+=v;
          if(s.name==="全屬性") ALL+=v;
          if(s.name==="防禦力") DEF+=v;
          if(s.name==="HP") HP+=v;
          if(s.name==="MP") MP+=v;
          if(s.name==="移動速度") MS+=v;
          if(s.name==="跳躍力") Jump+=v;
          if(s.name==="套用等級減少") LvMinus+=v;
        }
      });

      // 計算等效主屬（INT 為106主屬）
      const eq = INT+ LUK/secStat + MA*oneMA + ALL*oneAll;

      if(eq>=target){
        attemptsArr.push(attempts);
        eqValues.push(eq);

        if(logs.length<50){
          let line=[`第${i+1}件成功 (嘗試 ${attempts} 次) 等效主屬:${eq.toFixed(2)}`];
          // 主屬屬性
          if(STR) line.push(`STR +${STR}`);
          if(DEX) line.push(`DEX +${DEX}`);
          if(INT) line.push(`INT +${INT}`);
          if(LUK) line.push(`LUK +${LUK}`);
          if(MA) line.push(`魔攻 +${MA}`);
          if(ALL) line.push(`全屬 +${ALL}%`);
          // 其他屬性
          if(DEF) line.push(`防禦力 +${DEF}`);
          if(HP) line.push(`HP +${HP}`);
          if(MP) line.push(`MP +${MP}`);
          if(MS) line.push(`移動速度 +${MS}`);
          if(Jump) line.push(`跳躍力 +${Jump}`);
          if(LvMinus) line.push(`套用等級減少 ${LvMinus}`);
          logs.push(line.join("\n  - "));
        }
        break;
      }
    }
  }

  const attemptsStats = calcStats(attemptsArr);
  const eqStats = calcStats(eqValues);

  document.getElementById("statistics").innerText =
    `【達成目標等效主屬】\n`+
    `平均：${eqStats.avg.toFixed(2)} 主屬\n中位數：${eqStats.mid.toFixed(2)} 主屬\n標準差：${eqStats.std.toFixed(2)}\n\n`+
    `【達成目標嘗試次數】\n平均：${attemptsStats.avg.toFixed(2)} 次\n中位數：${attemptsStats.mid.toFixed(2)} 次\n標準差：${attemptsStats.std.toFixed(2)}`;

  document.getElementById("output").innerText =
    logs.length ? "成功的前 50 組模擬結果：\n\n"+logs.join("\n\n") : "沒有成功樣本";
}

document.getElementById("startSimBtn").addEventListener("click", simulate);
