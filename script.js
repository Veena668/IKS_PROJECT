const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let method = "substitution";
let lastEncrypted = "";
let lastShift = 3;

$$(".method").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".method").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    method = btn.dataset.method;
    $("#shiftRow").style.display = method === "substitution" ? "flex" : "none";
  });
});

function substitution(text, shift, decrypt=false) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const s = decrypt ? -shift : shift;
  return text.split("").map(ch => {
    const upper = ch.toUpperCase();
    const i = alphabet.indexOf(upper);
    if (i === -1) return ch;
    const out = alphabet[(i + s + 26) % 26];
    return ch === ch.toLowerCase() ? out.toLowerCase() : out;
  }).join("");
}

function transposition(text) {
  const chars = text.split("");
  const result = [];
  for (let i = 0; i < chars.length; i += 2) {
    if (i + 1 < chars.length) result.push(chars[i + 1], chars[i]);
    else result.push(chars[i]);
  }
  return result.join("");
}

function decryptTransposition(text) {
  return transposition(text); // pair-swap transposition is its own inverse
}

$("#encryptBtn").addEventListener("click", () => {
  const text = $("#message").value.trim();
  if (!text) return;
  const panel = $("#cipherAnimation");
  panel.classList.add("scanning");
  setTimeout(() => panel.classList.remove("scanning"), 1200);

  if (method === "substitution") {
    lastShift = Math.max(1, Math.min(25, Number($("#shift").value) || 3));
    lastEncrypted = substitution(text, lastShift);
    $("#explanation").innerHTML = `Substitution selected: each letter is shifted by <b>${lastShift}</b> position(s).`;
  } else {
    lastEncrypted = transposition(text);
    $("#explanation").innerHTML = `Transposition selected: adjacent character positions are rearranged using a simple educational rule.`;
  }
  $("#output").textContent = lastEncrypted;
  $("#decrypted").textContent = "";
  $("#decryptBtn").style.display = "inline-block";
});

$("#decryptBtn").addEventListener("click", () => {
  if (!lastEncrypted) return;
  const original = method === "substitution"
    ? substitution(lastEncrypted, lastShift, true)
    : decryptTransposition(lastEncrypted);
  $("#decrypted").textContent = "↳ Decrypted: " + original;
});

$("#copyBtn").addEventListener("click", async () => {
  if (!lastEncrypted) return;
  try {
    await navigator.clipboard.writeText(lastEncrypted);
    $("#copyBtn").textContent = "Copied ✓";
    setTimeout(() => $("#copyBtn").textContent = "Copy", 1200);
  } catch {
    $("#copyBtn").textContent = "Select & copy";
  }
});

$("#clearBtn").addEventListener("click", () => {
  $("#message").value = "";
  $("#output").textContent = "Your encrypted message will appear here.";
  $("#decrypted").textContent = "";
  lastEncrypted = "";
});

$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  $("#themeBtn").textContent = document.body.classList.contains("light") ? "☀" : "☾";
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, {threshold: .12});
$$(".reveal").forEach(el => observer.observe(el));

const questions = [
  {
    q:"Which IKS topic in the syllabus is linked with secure communication?",
    a:["Nyāya","Arthaśāstra","Prastāra","Aṣṭādhyāyī"], c:1
  },
  {
    q:"In a substitution cipher, what is changed?",
    a:["The rule-based representation of letters/symbols","Only the font","Only the background","The screen size"], c:0
  },
  {
    q:"What does transposition mainly do?",
    a:["Deletes letters","Rearranges positions","Changes the website theme","Compresses images"], c:1
  },
  {
    q:"Which modern field is strongly connected to information protection?",
    a:["Cybersecurity","Typography","Animation only","Photography"], c:0
  },
  {
    q:"What is the purpose of encryption?",
    a:["Make information harder for unauthorized readers to understand","Increase screen brightness","Remove all spaces","Create images"], c:0
  }
];

let qi = 0, score = 0, answered = false;

function loadQuestion() {
  answered = false;
  const item = questions[qi];
  $("#questionNumber").textContent = `Question ${qi+1} of ${questions.length}`;
  $("#question").textContent = item.q;
  $("#answers").innerHTML = "";
  $("#nextBtn").disabled = true;
  $("#nextBtn").textContent = qi === questions.length - 1 ? "Finish Quiz ✓" : "Next Question →";
  $("#progressBar").style.width = `${((qi+1)/questions.length)*100}%`;
  item.a.forEach((answer, i) => {
    const b = document.createElement("button");
    b.className = "answer";
    b.textContent = answer;
    b.addEventListener("click", () => chooseAnswer(b, i));
    $("#answers").appendChild(b);
  });
}
function chooseAnswer(button, index) {
  if (answered) return;
  answered = true;
  const item = questions[qi];
  $$(".answer").forEach((b, i) => {
    b.disabled = true;
    if (i === item.c) b.classList.add("correct");
  });
  if (index === item.c) {
    score++;
    $("#quizResult").textContent = "Correct! ✓";
  } else {
    button.classList.add("wrong");
    $("#quizResult").textContent = "Not quite — the highlighted answer is correct.";
  }
  $("#nextBtn").disabled = false;
}
$("#nextBtn").addEventListener("click", () => {
  if (!answered) return;
  if (qi < questions.length - 1) {
    qi++;
    $("#quizResult").textContent = "";
    loadQuestion();
  } else {
    $("#question").textContent = `Quiz complete! You scored ${score}/${questions.length}.`;
    $("#answers").innerHTML = `<div class="output">${score >= 4 ? "Excellent work! 🏆" : score >= 3 ? "Good job! 📜" : "Keep exploring the IKS concepts! 🔐"}</div>`;
    $("#nextBtn").textContent = "Restart Quiz ↻";
    $("#nextBtn").onclick = () => { qi=0; score=0; $("#quizResult").textContent=""; loadQuestion(); };
  }
});
loadQuestion();
