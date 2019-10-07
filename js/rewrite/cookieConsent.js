window.addEventListener("load", function(){
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "rgba(0, 0, 0, 0.95)",
                "text": "#ffffff",
            },
            "button": {
                "background": "transparent",
            }
        },
        "position": "bottom",
        "content": {
            "message": "Ta strona używa plików cookie. Kontynuując przeglądanie strony, zgadzasz się na korzystanie z plików cookie.",
            "dismiss": "Akceptuję",
            "link": "Więcej"
        }
    })
});