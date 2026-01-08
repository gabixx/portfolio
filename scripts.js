document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) Efeito "typed-word"
  // =========================
  const el = document.getElementById("typed-word");
  if (el) {
    const words = ["convertem", "vendem", "impactam"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 200;
    const deleteSpeed = 100;
    const holdTime = 900;

    function tick() {
      const current = words[wordIndex];
      el.classList.add("is-on");

      if (!isDeleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          setTimeout(() => {
            isDeleting = true;
            tick();
          }, holdTime);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);

        if (charIndex <= 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;

          el.classList.remove("is-on");
          setTimeout(() => {
            el.classList.add("is-on");
            tick();
          }, 120);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    el.classList.remove("is-on");
    setTimeout(() => {
      el.classList.add("is-on");
      tick();
    }, 250);
  }

  // =========================
  // 2) Formulário EmailJS (sem popup)
  //    - marca campo em vermelho
  //    - telefone obrigatório
  // =========================
  const form = document.getElementById("contact-form");
  if (!form) return;

  const button = form.querySelector(".btn-submit");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getInput = (name) => form.querySelector(`[name="${name}"]`);

  const inputs = {
    name: getInput("from_name"),
    email: getInput("reply_to"),
    phone: getInput("phone"),
    message: getInput("message"),
  };

  // helper: pega o .error-text logo após o input (se existir)
  function getErrorEl(input) {
    const el = input?.nextElementSibling;
    return el && el.classList.contains("error-text") ? el : null;
  }

  function setError(input, message) {
    if (!input) return;
    input.classList.add("input-error");

    const err = getErrorEl(input);
    if (err) {
      err.textContent = message;
      err.classList.add("active");
    }
  }

  function clearError(input) {
    if (!input) return;
    input.classList.remove("input-error");

    const err = getErrorEl(input);
    if (err) err.classList.remove("active");
  }

  // validações
  function validateName() {
    const v = inputs.name.value.trim();
    if (!v) return setError(inputs.name, "Informe seu nome"), false;
    clearError(inputs.name);
    return true;
  }

  function validateEmail() {
    const v = inputs.email.value.trim();
    if (!v) return setError(inputs.email, "Informe seu e-mail"), false;
    if (!emailRegex.test(v))
      return setError(inputs.email, "Digite um e-mail válido"), false;

    clearError(inputs.email);
    return true;
  }

  function validatePhone() {
    const v = inputs.phone.value.trim();
    const digits = v.replace(/\D/g, "");

    // TELEFONE OBRIGATÓRIO (com DDD)
    if (!v) return setError(inputs.phone, "Informe seu telefone"), false;
    if (digits.length < 10)
      return (
        setError(inputs.phone, "Digite um telefone válido (com DDD)"), false
      );

    clearError(inputs.phone);
    return true;
  }

  function validateMessage() {
    const v = inputs.message.value.trim();
    if (!v) return setError(inputs.message, "Digite sua mensagem"), false;
    clearError(inputs.message);
    return true;
  }

  // limpar erro ao digitar
  Object.values(inputs).forEach((inp) => {
    if (!inp) return;
    inp.addEventListener("input", () => clearError(inp));
    inp.addEventListener("blur", () => {
      // valida no blur (opcional, melhora UX)
      if (inp === inputs.name) validateName();
      if (inp === inputs.email) validateEmail();
      if (inp === inputs.phone) validatePhone();
      if (inp === inputs.message) validateMessage();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // garante EmailJS carregado
    if (typeof emailjs === "undefined") {
      setError(
        inputs.email,
        "EmailJS não carregou. Verifique a ordem dos scripts."
      );
      return;
    }

    // valida tudo
    const ok =
      validateName() && validateEmail() && validatePhone() && validateMessage();

    if (!ok) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Enviando...";

    try {
      await emailjs.sendForm("service_apklcge", "template_ommunt9", form);

      form.reset();
      Object.values(inputs).forEach(clearError);

      // feedback visual (sem popup)
      button.textContent = "Enviado ✓";
      button.classList.add("is-success"); // opcional (se quiser estilizar)
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove("is-success");
      }, 2200);
    } catch (err) {
      console.error("Erro EmailJS:", err);

      button.disabled = false;
      button.textContent = originalText;

      // sem popup: mostra erro no campo de e-mail (pode trocar pra outro)
      setError(
        inputs.email,
        "Não foi possível enviar agora. Tente me contatar pelas redes sociais :)."
      );
    }
  });
});
