document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("typed-word");
  if (el) {
    const words = ["convertem", "vendem", "impactam"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 200;
    const deleteSpeed = 100;
    const holdTime = 900;

    const setTypedText = (text) => {
      el.textContent = text && text.length ? text : "\u00A0";
    };

    function tick() {
      const current = words[wordIndex];
      el.classList.add("is-on");

      if (!isDeleting) {
        charIndex++;
        setTypedText(current.slice(0, charIndex));

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
        setTypedText(current.slice(0, charIndex));

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
    // inicia já com o "bloco" ocupando espaço
    setTypedText(words[0].slice(0, 1));
    charIndex = 1;

    setTimeout(() => {
      el.classList.add("is-on");
      tick();
    }, 250);
  }

  const form = document.getElementById("contact-form");
  if (form) {
    const button = form.querySelector(".btn-submit");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const getInput = (name) => form.querySelector(`[name="${name}"]`);

    const inputs = {
      name: getInput("from_name"),
      email: getInput("reply_to"),
      phone: getInput("phone"),
      message: getInput("message"),
    };

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

    function getCaptchaErrorEl() {
      const widget = form.querySelector(".g-recaptcha");
      if (!widget) return null;
      const err = widget.nextElementSibling;
      return err && err.classList.contains("error-text") ? err : null;
    }

    function setCaptchaError(message) {
      const err = getCaptchaErrorEl();
      if (!err) return;
      err.textContent = message;
      err.classList.add("active");
    }

    function clearCaptchaError() {
      const err = getCaptchaErrorEl();
      if (err) err.classList.remove("active");
    }

    function validateCaptcha() {
      if (typeof grecaptcha === "undefined") return true;

      const token = grecaptcha.getResponse();
      if (!token) {
        setCaptchaError("Confirme que você não é um robô");
        return false;
      }

      clearCaptchaError();
      return true;
    }

    function resetCaptcha() {
      if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      clearCaptchaError();
    }

    function validateName() {
      const v = inputs.name.value.trim();
      if (!v) return (setError(inputs.name, "Informe seu nome"), false);
      clearError(inputs.name);
      return true;
    }

    function validateEmail() {
      const v = inputs.email.value.trim();
      if (!v) return (setError(inputs.email, "Informe seu e-mail"), false);
      if (!emailRegex.test(v))
        return (setError(inputs.email, "Digite um e-mail válido"), false);

      clearError(inputs.email);
      return true;
    }

    function validatePhone() {
      const v = inputs.phone.value.trim();
      const digits = v.replace(/\D/g, "");

      if (!v) return (setError(inputs.phone, "Informe seu telefone"), false);
      if (digits.length < 10)
        return (
          setError(inputs.phone, "Digite um telefone válido (com DDD)"),
          false
        );

      clearError(inputs.phone);
      return true;
    }

    function validateMessage() {
      const v = inputs.message.value.trim();
      if (!v) return (setError(inputs.message, "Digite sua mensagem"), false);
      clearError(inputs.message);
      return true;
    }

    Object.values(inputs).forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("input", () => clearError(inp));
      inp.addEventListener("blur", () => {
        if (inp === inputs.name) validateName();
        if (inp === inputs.email) validateEmail();
        if (inp === inputs.phone) validatePhone();
        if (inp === inputs.message) validateMessage();
      });
    });

    const captchaWidget = form.querySelector(".g-recaptcha");
    if (captchaWidget) {
      captchaWidget.addEventListener("click", () => {
        setTimeout(() => {
          if (typeof grecaptcha !== "undefined" && grecaptcha.getResponse()) {
            clearCaptchaError();
          }
        }, 200);
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (typeof emailjs === "undefined") {
        setError(
          inputs.email,
          "EmailJS não carregou. Verifique a ordem dos scripts.",
        );
        return;
      }

      const ok =
        validateName() &&
        validateEmail() &&
        validatePhone() &&
        validateMessage() &&
        validateCaptcha();

      if (!ok) return;

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Enviando...";

      try {
        await emailjs.sendForm("service_86b7uka", "template_ommunt9", form);

        form.reset();
        Object.values(inputs).forEach(clearError);
        resetCaptcha();

        button.textContent = "Enviado ✓";
        button.classList.add("is-success");
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          button.classList.remove("is-success");
        }, 2200);
      } catch (err) {
        console.error("Erro EmailJS:", err);

        button.disabled = false;
        button.textContent = originalText;
        resetCaptcha();

        setError(
          inputs.email,
          "Não foi possível enviar agora. Tente me contatar pelas redes sociais :).",
        );
      }
    });
  }

  document.querySelectorAll(".stagger").forEach((group) => {
    group.querySelectorAll(".reveal").forEach((item, i) => {
      item.style.setProperty("--d", `${i * 120}ms`);
    });
  });

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -120px 0px",
      },
    );

    revealEls.forEach((el) => observer.observe(el));
  }
});

document.querySelectorAll('a[href*="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const hrefAttr = link.getAttribute("href");
    if (!hrefAttr || hrefAttr === "#") return;

    const url = new URL(link.href, window.location.href);

    const samePage =
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname;

    if (!samePage) return;

    const hash = url.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();

    history.pushState(null, "", hash);

    const header = document.querySelector(".header");
    const offset = header ? header.offsetHeight + 10 : 0;

    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  });
});
