$(document).ready(function() {
    $.get("./data/cloth.json", dbCloth => {
        $.get("./data/avatar.json", dbAvatar => {
            $.get("./data/room.json", dbRoom => {
                $.get("./data/pet.json", dbPet => {
                    $.get("./data/crush.json", dbCrush => {
                    
                        cloth = dbCloth;
                        avatar = dbAvatar;
                        room = dbRoom;
                        pet = dbPet;
                        crush = dbCrush;
                        
                        customTheme();
                        userSettings();
                        clearInputFilter();
                        drawCategory();
                        fillCounter();
                        updateVWVH();
                        drawAvatarZone();
                        $("#asng-z-index .ss-scroll").addClass("ss-hidden");

                        checkAndGetTempCode();
                        codeUpdate();
                        currentPage("wardrobe");
                        // tempWM("load");
                    });
                });
            });
        });
    });
});

async function tempWM(type) {
    if (type == "load") {
        alert("Debido a un concurso oficial en curso, se ha añadido una marca de agua temporal para evitar el uso del vestidor en el mismo.\nDisculpen las molestias.");
        $("#asng-avatar").append('<img class="temp-wm" src="./assets/wm.png">');

    } else if (type == "save") {

        if ($("#save-canvas").length == 1 && $("#save-canvas").attr("width") != 1920) {
            let ctx = document.getElementById("save-canvas").getContext("2d");

            let w = 1200, h = 1550;
            let t = h * 34/100, l = w * 44/100;
            let nw = 413 * 75/100, nh = 151 * 75/100;

            let img = "./assets/wm.png";
            let ready = await preloadIMG(img);
            ctx.drawImage(ready, t, l, nw, nh);
        };
    };
};

async function codeUpdate() {
    $(".eye-color .color").removeClass("equipped");
    $(`.eye-color .color[data-color=${sucrette.avatar.eyesColor}]`).addClass("equipped");
    $(".hair-color .color").removeClass("equipped");
    $(`.hair-color .color[data-color=${sucrette.avatar.hair}]`).addClass("equipped");
    $(".skin-color .color").removeClass("equipped");
    $(`.skin-color .color[data-color=${sucrette.avatar.skin}]`).addClass("equipped");

    $("#loading-layout").addClass("room avatar");

    drawCrush();
    drawSucrette();
    drawRoomCanvas();
    drawZIndex();
    drawPet();
}

async function drawCategory(c = "top", declination = null) {
    
    // filters ?
    let search = $(".filter-by-name-input input").val().trim();
    let filterType = $('.filter-by-type .type.active').length == 1 ? $('.filter-by-type .type.active').data("type") : null;

    let lista = [], type = "cloth";
    if (search != "") {
        c = "auto";
        search = normalize(search).toLowerCase();
        // so sloooooooow
        lista = cloth.filter(v => {return v.outfitName != null && (normalize(v.outfitName).toLowerCase()).includes(search)});
    } else {
        lista = cloth.filter(v => {return v.category == c});
    }

    // grouped ?

    if (c == "eyebrows" || c == "eyes" || c == "mouth") {
        lista = avatar.collections[c].filter(v => {return v.category == c});
        type = c;
    };

    if (filterType != null) {
        lista = lista.filter(v => {return v.criteria != null && v.criteria.type == filterType});
    };

    if (lista.length > 0) {

        $("asng-cloth-list-panel .empty").remove();

        // ordenar por fechas
        lista.sort((a,b) => (a.releaseDate < b.releaseDate) ? 1 : ((b.releaseDate < a.releaseDate) ? -1 : 0))

        if (declination == null) {
            moveScroll("#clothes-container .ss-content", "reset");
            $("#asng-avatar-item-list-panel .items-container").html("");
    
            // General grouped list
    
            for (i = 0; i < lista.length; i++) {
                if (lista[i].variations.length > 1) {
                    $("#asng-avatar-item-list-panel .items-container").append(`<div class="asng-cloth grouped" data-item="${lista[i].groupId}-${lista[i].variations[0].id}"></div>`);
                    $(".asng-cloth").eq(i)
                    .append('<img src="assets/personalization/hanger.png" class="hanger" />')
                    .append('<div class="group" tooltipplacement="bottom" tooltippanelclass="asng-dressing-item-tooltip"></div>');
                    $(".asng-cloth").eq(i).find('div')
                    .append(`<img class="thumbnail" alt="${lista[i].name}" title="${lista[i].outfitName != null ? lista[i].outfitName : ""}" src="${composeHangerUrl(lista[i].variations[0].id, lista[i].security, type)}">`)
                    .append(`<div class="counter">${lista[i].variations.length}</div>`);

                    if (lista[i].criteria != null) drawItemIcons(lista[i].criteria, $(".asng-cloth").eq(i).find('div').not(".counter"));

                } else {
                    var dataI = `${lista[i].groupId}-${lista[i].variations[0].id}`;

                    $("#asng-avatar-item-list-panel .items-container").append(`<div class="asng-cloth item" data-category="${lista[i].category}" data-item="${dataI}"></div>`);

                    // Comprobar si está equipado
                    let A = `${lista[i].variations[0].id}-${lista[i].security}`;
                    let E = sucrette.orderInfo.filter(v => {return v.value == A});
                    if (c == "skin") c = "customSkin";
                    (E.length > 0) ? E = " equipped" : (sucrette.avatar[c] == A) ? E = " equipped" : E = "";

                    $(".asng-cloth").eq(i)
                        .append('<img src="assets/personalization/hanger.png" class="hanger" />')
                        .append(`<div class="item"><div class="item-outline${E}"></div></div>`);
                    $(`.asng-cloth[data-item="${dataI}"] .item`)
                        .append('<div tooltipplacement="bottom" tooltippanelclass="asng-dressing-item-tooltip"></div>');
                    $(`.asng-cloth[data-item="${dataI}"] div`).not(".item").not('.item-outline')
                    .append(`<img class="thumbnail" alt="${lista[i].name}" title="${lista[i].outfitName != null ? lista[i].outfitName : ""}" src="${composeHangerUrl(lista[i].variations[0].id, lista[i].security, type)}">`);

                    if (lista[i].criteria != null) drawItemIcons(lista[i].criteria, $(".asng-cloth").eq(i).find('div').not(".item").not(".item-outline"));

                };
            };
    
        } else {
            // Grouped list with open declinations

            var d = cloth.filter(v => {return v.groupId == declination});

            if (c == "eyebrows" || c == "eyes" || c == "mouth") {
                d = avatar.collections[c].filter(v => {return v.groupId == declination});
        
            } else if (c == "expressions") {
                // pendiente
            }

            let filas = Math.ceil((d[0].variations.length + 1) / 3); // Filas totales
            $(".declinations-list-container").attr("style", `height: calc(140px * ${filas})`);
    
            for (x = 0; x < d[0].variations.length; x++) {
                $('.declinations-panel').append(`<div class="asng-cloth item" data-category="${c}" data-item="${d[0].groupId}-${d[0].variations[x].id}"></div>`);

                // Comprobar si está equipado
                let A = `${d[0].variations[x].id}-${d[0].security}`;
                let E = sucrette.orderInfo.filter(v => {return v.value == A});
                if (c == "skin") c = "customSkin";
                (E.length > 0) ? E = " equipped" : (sucrette.avatar[c] == A) ? E = " equipped" : E = "";

                $(".declinations-panel .asng-cloth").eq(x)
                    .append('<img src="assets/personalization/hanger.png" class="hanger" />')
                    .append(`<div class="item"><div class="item-outline${E}"></div></div>`);
                $('.declinations-panel .asng-cloth .item').eq(x)
                    .append('<div tooltipplacement="bottom" tooltippanelclass="asng-dressing-item-tooltip"></div>');
                $('.declinations-panel .asng-cloth .item').eq(x).find('div').not('.item-outline')
                    .append(`<img class="thumbnail" alt="${d[0].name}" title="${(d[0].outfitName != null ? d[0].outfitName : "")}" src="${composeHangerUrl(d[0].variations[x].id, d[0].security, type)}">`);
            };
        }
    
    } else if (c == "expression") {
        $("#asng-avatar-item-list-panel .items-container").html("");
        $("#asng-avatar-item-list-panel .items-container").append('<div id="expressions-menu"></div>');
        $("#expressions-menu")
            .append('<div class="show-presets"><h2>Predefinidas</h2></div>')
            .append('<div class="show-custom"><h2>Custom</h2></div>');
        $("#asng-avatar-item-list-panel .items-container").append('<div id="expressions-container"></div>');
        drawExpressions("preset");

    } else {
        $("#asng-avatar-item-list-panel .items-container").html("");
        $("asng-cloth-list-panel").append('<div class="empty"><img class="taki" src="https://www.corazondemelon-newgen.es/assets/taki/box.png" /><p>No hay elementos en esta categoría.</p></div>');
    };

    if (declination != null) {
        let sv = $("#clothes-container .ss-content").scrollTop();
        moveScroll("#clothes-container .ss-content", sv);
    } else {
        moveScroll("#clothes-container .ss-content", "reset");
    };
    

};

function moveScroll(elmnt, sv) {
    if (sv != "reset") {
        sv - 1 == -1 ? sv++ : sv--;
        $(elmnt).scrollTop(sv);
    } else {
        $(elmnt).scrollTop(1);
        $(elmnt).scrollTop(0);
    };
};

function drawDeclinationPanel(index) {

    // buscar ubicación 
    let after = Math.ceil((index) * 0.34); // Insertar panel despues de AFTER filas
    let tg = $(".asng-cloth").length; // Items totales
    ((after < 3 && tg < 3) || after * 3 > tg) ? after = tg : after == 0 ? after = 3 : after = after * 3; // Insertar después de AFTER elementos

    $(".items-container > .asng-cloth:nth-child(" + (after) + ")").after(`<div class="declinations-list-container"></div>`);
    $(".declinations-list-container").append('<div class="inner-declinations"><div class="declinations-panel"></div></div>');
    var personality = $("body").attr("class").split("-")[1];
    $(".declinations-panel").append(`<img class="close" height="80" width="80" src="assets/personalization/item/close-declinations-${personality}.png">`);

};

function removeDeclinationPanel() {
    let sv = $("#clothes-container .ss-content").scrollTop();
    moveScroll("#clothes-container .ss-content", sv);

    $(".asng-cloth").removeClass("selected").removeClass("not-selected");
    $(".declinations-list-container").remove();

    moveScroll("#clothes-container .ss-content", sv);
}

function drawExpressions(e) {
    $("#expressions-container").html("");
    
    if (e == "preset") {
        $(".show-custom").removeClass("active");
        $(".show-presets").addClass("active");

        $("#expressions-container").append(`<ul style="width: 100%;"></ul>`);
        for (i = 0; i < avatar.expressionsPresets.length; i++) {
            $("#expressions-container ul").append(`<li class="expression preset" data-index="${i}">${i + 1}</li>`);
            if (sucrette.avatar.expressionPreset == i) $(".expression.preset").eq(i).addClass("active");
        };

    } else if (e == "custom") {
        $(".show-presets").removeClass("active");
        $(".show-custom").addClass("active");

        $("#expressions-container").append(`<div class="expression-content"><div class="expression-category eyebrow"></div><ul></ul></div>`);
        for (i = 0; i < avatar.expressions.eyebrow.length; i++) {
            $(".expression-content ul").eq(0).append(`<li class="expression eyebrow" data-index="${i}">${i + 1}</li>`);
            if (sucrette.avatar.expression.eyebrow == avatar.expressions.eyebrow[i]) $(".expression.eyebrow").eq(i).addClass("active");
        };

        $("#expressions-container").append(`<div class="expression-content"><div class="expression-category eye"></div><ul></ul></div>`);
        for (i = 0; i < avatar.expressions.eye.length; i++) {
            $(".expression-content ul").eq(1).append(`<li class="expression eye" data-index="${i}">${i + 1}</li>`);
            if (sucrette.avatar.expression.eye == avatar.expressions.eye[i]) $(".expression.eye").eq(i).addClass("active");
        };

        $("#expressions-container").append(`<div class="expression-content"><div class="expression-category mouth"></div><ul></ul></div>`);
        for (i = 0; i < avatar.expressions.mouth.length; i++) {
            $(".expression-content ul").eq(2).append(`<li class="expression mouth" data-index="${i}">${i + 1}</li>`)
            if (sucrette.avatar.expression.mouth == avatar.expressions.mouth[i]) $(".expression.mouth").eq(i).addClass("active");
        };
    };
};

function toggleCategoryMenu(status, crush = false) {

    if (!crush) {
        status.includes("open") ? $("asng-category-list .list").removeClass("open").addClass("closed") : $("asng-category-list .list").removeClass("closed").addClass("open");

        setTimeout(function() {
            $("asng-category-list .list .ss-content").scrollTop(1);
            $("asng-category-list .list .ss-content").scrollTop(0);
        }, 200);

    } else {
        status.includes("open") ? $("asng-crush-list .list").removeClass("open").addClass("closed") : $("asng-crush-list .list").removeClass("closed").addClass("open");
    };
    
};

function drawAvatarZone(c = "top", z = "auto") {
    if (z == "auto") {
        arr = ["head", "face", "torso", "arms", "waistToKnee", "feet", "general"];
        // buscar zona
        for (a = 0; a < arr.length; a++) {
            z = zone[arr[a]].filter(v => {return v.category == c});
            if (z.length > 0) {
                z = arr[a];
                break;
            };
        };

    } else if (c == "auto") {
        switch (z) {
            case "general": c = "skin";break;
            case "head": c = "hat";break;
            case "face": c = "makeup";break;
            case "torso": c = "top";break;
            case "arms": c = "gloves";break;
            case "waistToKnee": c = "pants";break;
            case "feet": c = "shoes";break;
        };

        // change category !
        $(".category-list-item.current").removeClass("current");
        $(`.category-list-item[data-category="${c}"]`).addClass("current");
        $(".current-category").text(getCategoryName(c));
        toggleCategoryMenu("open");
        drawCategory(c);
    };

    var currentZ = $(".avatar-personalization").attr("class");
    currentZ = currentZ.split(" ")[1];

    if (!(currentZ == z)) {
        $(".avatar-personalization").attr("class", `avatar-personalization ${z}`);

        $(".categories").html("");

        for (i = 0; i < zone[z].length; i++) {
            $(".categories").append(`<div id="dressing-section-category-${zone[z][i].category}" class="category" style="${zone[z][i].style}"></div>`);
            $(`#dressing-section-category-${zone[z][i].category}`).append('<div class="category-icon"></div>');
        };
    };

    $(".category").removeClass("current");
    $(`#dressing-section-category-${c}`).addClass("current");
}

function preloadIMG(src) {
    return new Promise(resolve => {
        var img = new Image();
        img.src = src;
        img.onload = () => {resolve(img)}; 
    });
};

async function drawSucrette(size = cr, mode = "load", rd = null) {
    // 1200 x 1550

    if (mode == "load" || mode == "update_avatar" || mode == "basics") {
        if (mode != "update_avatar") $(".avatar-canvas").remove();
        if (mode == "load") $("#loading-layout").addClass("avatar");

        // check crush save position
        if ($("#save-canvas").length == 1 && sucrette.crush.position == "back" && sucrette.crush.outfit != null) {
            await drawCrush(true);
        };

        for (m = 0; m < sucrette.orderInfo.length; m++) {
            if (sucrette.orderInfo[m].category == "avatar") {
                $("#asng-avatar").append('<canvas class="avatar-canvas" id="avatar-base" width="1200" height="1550"></canvas>');

                // draw avatar base

                var ctx = $("#save-canvas").length == 0 ? document.getElementById("avatar-base").getContext("2d") : document.getElementById("save-canvas").getContext("2d");
                if (mode == "update_avatar" || mode == "basics") ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                let w = 1200, h = 1550;
                if ( $("#save-canvas").length == 1 && $("#save-canvas").attr("width") == 1920 ) {
                    w = 1920; h = 1080;
                };

                let img = "", ready = "";

                // // draw crush first ?
                // if ($("#save-canvas").length == 1 && sucrette.crush.position == "back" && sucrette.crush.outfit != null && size == "hd") {
                //     let c = (sucrette.crush.outfit).split("-");
                //     img = size == "hd" ? composeCrushUrl(c[0], c[1], "full", size) : composeCrushUrl(c[0], c[1], "big", size);
                //     ready = await preloadIMG(img);
                //     ctx.drawImage(ready, 0, 0, w, h);
                // };

                img = (sucrette.avatar.customSkin == null) ? composeAvatarUrl("skin", size, sucrette.avatar.skin) : composeCanvasUrl("cloth", size, sucrette.avatar.customSkin);
                ready = await preloadIMG(img);
                ctx.drawImage(ready, 0, 0, w, h);

                img = composeAvatarUrl("mouth", size, sucrette.avatar.mouth);
                ready = await preloadIMG(img);
                ctx.drawImage(ready, 0, 0, w, h);

                img = composeAvatarUrl("eyes_skin", size, sucrette.avatar.eyes);
                ready = await preloadIMG(img);
                ctx.drawImage(ready, 0, 0, w, h);

                img = composeAvatarUrl("eyes", size, sucrette.avatar.eyes);
                ready = await preloadIMG(img);
                ctx.drawImage(ready, 0, 0, w, h);

                img = composeAvatarUrl("eyebrows_skin", size, sucrette.avatar.eyebrows);
                ready = await preloadIMG(img);
                ctx.drawImage(ready, 0, 0, w, h);

                img = composeAvatarUrl("eyebrows", size, sucrette.avatar.eyebrows);
                ready = await preloadIMG(img);
                ctx.drawImage(ready, 0, 0, w, h);

                if (mode == "basics") {
                    // Ropa interior
                    let x = sucrette.orderInfo.findIndex(v => v.category == "underwear");
                    img = composeCanvasUrl("cloth", size, sucrette.orderInfo[x].value);
                    $("#save-canvas").length == 0 ? newCanvas(sucrette.orderInfo[x].category, img, 1) : await newCanvas(sucrette.orderInfo[x].category, img, 1);

                    // Cabello
                    img = composeAvatarUrl("hair", size, sucrette.avatar.hair, "back");
                    $("#save-canvas").length == 0 ? newCanvas("hair", img, 2) : await newCanvas("hair", img, 2);

                    img = composeAvatarUrl("hair", size, sucrette.avatar.hair, "front");
                    $("#save-canvas").length == 0 ? newCanvas("hair", img, 3) : await newCanvas("hair", img, 3);

                    break;
                }


            } else if (sucrette.orderInfo[m].category == "hair" && mode != "update_avatar") {

                // draw hair (no wig)
                var img = composeAvatarUrl("hair", size, sucrette.avatar.hair, sucrette.orderInfo[m].layer);
                $("#save-canvas").length == 0 ? newCanvas(`${sucrette.orderInfo[m].category}-${sucrette.orderInfo[m].layer}`, img, m) : await newCanvas(`${sucrette.orderInfo[m].category}-${sucrette.orderInfo[m].layer}`, img, m);

            } else if (mode != "update_avatar" && mode != "basics") {

                // draw all

                var e = cloth.filter(v => {return v.security == ((sucrette.orderInfo[m].value).split("-")[1])})

                if (!(e[0].multiLayered)) {

                    // draw mono layer
                    var img = composeCanvasUrl("cloth", size, sucrette.orderInfo[m].value);
                    $("#save-canvas").length == 0 ? newCanvas(sucrette.orderInfo[m].category, img, m) : await newCanvas(sucrette.orderInfo[m].category, img, m);
                
                } else {

                    // draw multi layer
                    var img = composeCanvasUrl("cloth", size, sucrette.orderInfo[m].value, sucrette.orderInfo[m].layer);
                    $("#save-canvas").length == 0 ? newCanvas(`${sucrette.orderInfo[m].category}-${sucrette.orderInfo[m].layer}`, img, m, "append") : await newCanvas(`${sucrette.orderInfo[m].category}-${sucrette.orderInfo[m].layer}`, img, m, "append");

                };
            };
        };

        // check crush save position
        if ($("#save-canvas").length == 1 && sucrette.crush.position == "front" && sucrette.crush.outfit != null) {
            await drawCrush(true);
        };

        // tempWM("save");

    } else if (mode == "new") {

        var temp = []
        
        if (rd == null) { // Es mono o es multi último
            rd = sucrette.orderInfo.length - 1;
        };

        temp.push (sucrette.orderInfo[rd]);

        if (temp[0].layer == null) {
            // Es mono
            var img = composeCanvasUrl("cloth", size, temp[0].value);
            $("#save-canvas").length == 0 ? newCanvas(sucrette.orderInfo[rd].category, img, rd) : await newCanvas(sucrette.orderInfo[rd].category, img, rd);

        } else {
            // Es multi
            var T = temp[0].category != "hair" ? "cloth" : "avatar-part";
            var V = temp[0].category != "hair" ? temp[0].value : sucrette.avatar.hair;
            var P = rd == 0 ? "prepend" : "append";
            var img = temp[0].category != "hair" ? composeCanvasUrl(T, size, V, temp[0].layer) : composeAvatarUrl("hair", size, sucrette.avatar.hair, temp[0].layer);
            $("#save-canvas").length == 0 ? newCanvas(`${temp[0].category}-${temp[0].layer}`, img, rd, P) : await newCanvas(`${temp[0].category}-${temp[0].layer}`, img, rd, P);
        };

    } else if (mode == "replace") {
        var ctx = document.getElementsByClassName("avatar-canvas")[rd].getContext("2d");
        
        var T = sucrette.orderInfo[rd].category != "hair" ? "cloth" : "avatar-part";
        var V = sucrette.orderInfo[rd].category != "hair" ? sucrette.orderInfo[rd].value : sucrette.avatar.hair;
        var img = composeCanvasUrl(T, size, V, sucrette.orderInfo[rd].layer);
        var ready = await preloadIMG(img);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(ready, 0, 0, 1200, 1550);
    };

    $("#loading-layout").removeClass("avatar");
};

async function newCanvas(info, img, i = new Number, p = "append") {
    if ($("#save-canvas").length == 0) {
        if (p == "append") {
            $("#asng-avatar").append(`<canvas class="avatar-canvas" data-info="${info}" width="1200" height="1550"></canvas>`);
        } else {
            $("#asng-avatar").prepend(`<canvas class="avatar-canvas" data-info="${info}" width="1200" height="1550"></canvas>`);
        };

        var ctx = document.getElementsByClassName("avatar-canvas")[i].getContext("2d");
        ready = await preloadIMG(img);
        ctx.drawImage(ready, 0, 0, 1200, 1550);

    } else {
        var ctx = document.getElementById("save-canvas").getContext("2d");
        ready = await preloadIMG(img);
        ( $("#save-canvas").attr("width") == 1200 ) ?
        ctx.drawImage(ready, 0, 0, 1200, 1550) : ctx.drawImage(ready, 0, 0, 1920, 1080);
    };
};

function checkCurrentItems(id) {

    let check = sucrette.orderInfo.filter(v => {return v.value == id})
    if (check.length > 0) {
        // Es duplicado, quitar
        if (check[0].category != "underwear") {
            let f = null, b = null;
            if (check.length == 1) {
                // Quitar mono
                f = sucrette.orderInfo.findIndex(v => {return v.value == id});
    
            } else {
                // Quitar multi
                f = sucrette.orderInfo.findIndex(v => {return v.value == id && v.layer == "front"});
                b = sucrette.orderInfo.findIndex(v => {return v.value == id && v.layer == "back"});
            };

            sucrette.orderInfo.splice(f, 1);
            $(".avatar-canvas").eq(f).remove();

            if (b != null) {
                sucrette.orderInfo.splice(b, 1);
                $(".avatar-canvas").eq(b).remove();
            };

            if (check[0].category == "wig") {
                // Añadir cabello
                sucrette.orderInfo.unshift({"category":"hair", "layer":"back", "value":"auto"});
                sucrette.orderInfo.push({"category":"hair", "layer":"front", "value":"auto"});
                drawSucrette(cr, "new", 0);
                drawSucrette(cr, "new");
            };
            drawZIndex();
            return false;

        } else {
            // No se puede quitar
            return true;
        };
        

    } else {
        // Es variación de color?
        let d = id.split("-")[1];
        let A = sucrette.orderInfo.filter(v => {return v.value != null && (v.value).includes( d )});

        if (A.length > 0) {
            check = cloth.filter(v => {return v.security == d});
            let f = null, b = null;
            if (check[0].multiLayered) {
                // Reemplazar color multi
                f = sucrette.orderInfo.findIndex(v => {return v.value != null && v.value.includes( d ) && v.layer == "front"});
                b = sucrette.orderInfo.findIndex(v => {return v.value != null && v.value.includes( d ) && v.layer == "back"});
            } else {
                // Reemplazar color mono
                f = sucrette.orderInfo.findIndex(v => {return v.value != null && v.value.includes( d )});
            };

            sucrette.orderInfo[f].value = id;
            drawSucrette(cr, "replace", f);
            if (b != null) {
                sucrette.orderInfo[b].value = id;
                sucrette.orderInfo[f].layer = "front";
                sucrette.orderInfo[b].layer = "back";
                drawSucrette(cr, "replace", b);
            } else {
                sucrette.orderInfo[f].layer = null;
            }

            drawZIndex();
            return true;

        } else {
            // Es skin ?
            let isSkin = cloth.filter(v => {return v.security == d});

            // Es avatar o es nuevo ?
            let c = id.includes("hair") ? "eyebrows" : id.includes("eyes") ? "eyes" : "";
            if (c == "") {
                let t = id.split("-")[1]
                let m = avatar.collections.mouth.filter(v => {return v.security == t});
                (m.length == 1) ? c = "mouth" : isSkin[0].category == "skin" ? c = "customSkin" : c = "cloth";
            } else {
                id = `${id.split("-")[0]}-${id.split("-")[2]}`;
            };


            if (c == "cloth") {

                check = cloth.filter(v => {return v.security == (id.split("-")[1])});

                if (!check[0].multiLayered && check[0].category == "underwear") {
                    // Se reemplaza
                    let lc = sucrette.orderInfo.filter(v => {return v.category == "underwear"});
                    if (lc.length == 1) {
                        // Hay mono, reemplazar
                        let f = sucrette.orderInfo.findIndex(v => {return v.category == "underwear"});
                        sucrette.orderInfo[f].value = id;
                        drawSucrette(cr, "replace", f);

                    } else {
                        // Hay multi, quitar back y reemplazar front
                        let f = sucrette.orderInfo.findIndex(v => {return v.category == "underwear" && v.layer == "front"});
                        let b = sucrette.orderInfo.findIndex(v => {return v.category == "underwear" && v.layer == "back"});

                        $(".avatar-canvas").eq(b).remove();
                        sucrette.orderInfo.splice(b, 1);
                        f--;

                        sucrette.orderInfo[f].value = id;
                        sucrette.orderInfo[f].layer = null;
                        drawSucrette(cr, "replace", f);
                    };

                } else if (check[0].multiLayered && check[0].category == "underwear") {
                    // Es underwear multi 
                    let lc = sucrette.orderInfo.filter(v => {return v.category == "underwear"});
                    if (lc.length = 1) {
                        // Hay mono, reemplazar con front y añadir back
                        let f = sucrette.orderInfo.findIndex(v => {return v.category == "underwear"});
                        sucrette.orderInfo[f].value = id;
                        sucrette.orderInfo[f].layer = "front";

                        sucrette.orderInfo.splice(f, 0, {"category":"underwear", "layer":"back", "value":id});
                        $("#asng-avatar > canvas:nth-child(" + (f) + ")").after('<canvas class="avatar-canvas" data-info="underwear" width="1200" height="1550"></canvas>');

                        drawSucrette(cr, "replace", f);
                        drawSucrette(cr, "replace", f + 1);

                    } else {
                        // Hay multi, reemplazar front y back
                        let f = sucrette.orderInfo.findIndex(v => {return v.category == "underwear" && v.layer == "front"});
                        let b = sucrette.orderInfo.findIndex(v => {return v.category == "underwear" && v.layer == "back"});

                        sucrette.orderInfo[b].value = id;
                        sucrette.orderInfo[f].value = id;

                        drawSucrette(cr, "replace", f);
                        drawSucrette(cr, "replace", b);
                    };
            
                } else {
                    if (check[0].category == "wig") {
                        // Se quita hair o wig actual
                        let p = sucrette.orderInfo.filter(v => {return v.category == "hair"});
                        let cc = null;
                        if (p.length > 0) {
                            cc = "hair";
                        } else {
                            p = sucrette.orderInfo.filter(v => {return v.category == "wig"});
                            (p.length > 0) ? cc = "wig" : cc = null;
                        };

                        if (cc != null) {
                            // Existe hair/wig, quitar
                            let f = sucrette.orderInfo.findIndex(v => {return v.category == cc && v.layer == "front"});
                            let b = sucrette.orderInfo.findIndex(v => {return v.category == cc && v.layer == "back"});

                            if (b + f == -2) {
                                f = sucrette.orderInfo.findIndex(v => {return v.category == cc && v.layer == null});
                                sucrette.orderInfo.splice(f, 1);
                                $(".avatar-canvas").eq(f).remove();

                            } else {
                                sucrette.orderInfo.splice(f, 1);
                                sucrette.orderInfo.splice(b, 1);
                                $(".avatar-canvas").eq(f).remove();
                                $(".avatar-canvas").eq(b).remove();
                            };
                        };
                    };

                    // Se añade nuevo elemento
                    if (check[0].multiLayered) {
                        
                        if (check[0].layerBehavior == "backInFront") {
                            sucrette.orderInfo.push({"category":check[0].category, "layer":"back", "value":id});
                            sucrette.orderInfo.push({"category":check[0].category, "layer":"front", "value":id});
                            drawSucrette(cr, "new", sucrette.orderInfo.length - 2);
                            drawSucrette(cr, "new");

                        } else if (check[0].layerBehavior == "normal") {
                            sucrette.orderInfo.unshift({"category":check[0].category, "layer":"back", "value":id});
                            sucrette.orderInfo.push({"category":check[0].category, "layer":"front", "value":id});
                            drawSucrette(cr, "new", 0);
                            drawSucrette(cr, "new");

                        };

                    } else {
                        sucrette.orderInfo.push({"category":check[0].category, "layer":null, "value":id});
                        drawSucrette(cr, "new");
                    };
                };

                drawZIndex();
                return true;

            } else {
                // Solo reemplazar no quitar!
                if (sucrette.avatar[c] != id) {
                    sucrette.avatar[c] = id;

                    drawSucrette(cr, "update_avatar");
                    drawZIndex();
                    return true;

                } else if (c == "customSkin") {
                    // Quitar y reemplazar por la original
                    sucrette.avatar[c] = null;

                    drawSucrette(cr, "update_avatar");
                    drawZIndex();
                    return false;
                };
            };
            
        };
    };
};

function drawZIndex() {
    let sv = $("#asng-z-index .ss-content").scrollTop();
    moveScroll("#asng-z-index .ss-content", sv);
    $("#z-index-content").html('');
    let z = 0;

    for (i = sucrette.orderInfo.length-1; i >= 0; i--) {
        let c = sucrette.orderInfo[i].category;
        let l = sucrette.orderInfo[i].layer;
        let v = sucrette.orderInfo[i].value;

        $("#z-index-content").append(`<div class="cdk-drag item${c == "avatar" ? " drag-disabled" : ""}" data-index="${i}" data-category="${c == "avatar" ? "skin": c == "hair" ? "wig" : c }"></div>`);
        if (c != "avatar") {
            $("#z-index-content .item").eq(z).append('<div class="z-index-move"><div class="zim move-up"></div><div class="zim move-down"></div></div>');
        }


        if (c != "avatar" && c != "underwear" && c != "hair") $("#z-index-content .item").eq(z).append('<div class="remove"></div>');

        let img = "";
        if (c != "hair" && c != "avatar") {
            img = composeHangerUrl(v.split("-")[0], v.split("-")[1]);
        } else if (c == "hair") {
            img = composeHangerUrl(sucrette.avatar.hair, null, c);
        } else if (c == "avatar") {
            // img = composeHangerUrl(sucrette.avatar.customSkin != null ? sucrette.avatar.customSkin : sucrette.avatar.skin, null, "skin");
            let cs = sucrette.avatar.customSkin;
            img = cs != null ? composeHangerUrl(cs.split("-")[0], cs.split("-")[1]) : composeHangerUrl(sucrette.avatar.skin, null, "skin");
        };

        $("#z-index-content .item").eq(z).append(`<img resolution="${hr}" src="${img}">`);

        if (l != null) {
            let p = window.localStorage.getItem("personality");

            if (l == "front") {
                $("#z-index-content .item").eq(z).append(`<div class="front-icon"><img src="assets/personalization/z-index/top-${p}.svg"</div>`);
                
            } else if (l == "back") {
                $("#z-index-content .item").eq(z).append(`<div class="back-icon"><img src="assets/personalization/z-index/back-${p}.svg"</div>`);
            };
        };

        z++;


    };

    moveScroll("#asng-z-index .ss-content", sv);
}
// Move elements
function moveItems(z, d) {
    let c1 = sucrette.orderInfo[z].category;
    let l1 = sucrette.orderInfo[z].layer;
    let v1 = sucrette.orderInfo[z].value;

    if (d == "down" && z != 0) {
        let c2 = sucrette.orderInfo[z - 1].category;
        let l2 = sucrette.orderInfo[z - 1].layer;
        let v2 = sucrette.orderInfo[z - 1].value;

        if (c1 == "underwear") {
            // si es underwear no puede bajar avatar
            if (c2 != "avatar") arrayMove(z, z - 1);

        } else if (l1 == "front" && l2 == "back") {
            // si es front no puede bajar back
            if (v1 != v2) arrayMove(z, z - 1);

        } else { 
            arrayMove(z, z - 1);
        };

    } else if (d == "up" && z != (sucrette.orderInfo.length - 1)) {
        let c2 = sucrette.orderInfo[z + 1].category;
        let l2 = sucrette.orderInfo[z + 1].layer;
        let v2 = sucrette.orderInfo[z + 1].value;
        // si back no puede subir front
        if (l1 == "back" && l2 == "front") {
            if (v1 != v2) arrayMove(z, z + 1);
        } else {
            arrayMove(z, z + 1);
        };
    };

    drawZIndex();
};

function arrayMove(from, to) {
    let item = sucrette.orderInfo[from];
    sucrette.orderInfo.splice(from, 1);
    sucrette.orderInfo.splice(to, 0, item);
    moveCanvas(from, to);
};

function moveCanvas(from, to) {
    let elmnt = document.getElementsByClassName("avatar-canvas")[from];
    if (from > to) { // baja
        elmnt.parentNode.insertBefore(elmnt, elmnt.previousElementSibling);
    } else { // sube
        elmnt.parentNode.insertBefore(elmnt.nextElementSibling, elmnt);
    };
}

// Delete elements
function removeItem(z) {
    let c = sucrette.orderInfo[z].category;
    let l = sucrette.orderInfo[z].layer;
    let v = sucrette.orderInfo[z].value;

    if (c != "underwear" && c != "hair" && c != "avatar" ) {
        if (l == null) {
            // Solo una capa, eliminar
            sucrette.orderInfo.splice(z, 1);
            $(".avatar-canvas").eq(z).remove();

        } else {
            // Varias capas
            let z2 = "";
            (l == "back") ? 
                z2 = sucrette.orderInfo.findIndex(x => {return (x.value == v && x.layer == "front")}) 
                : z2 = sucrette.orderInfo.findIndex(x => {return (x.value == v && x.layer == "back")});

            if (z > z2) {
                sucrette.orderInfo.splice(z, 1);
                $(".avatar-canvas").eq(z).remove();
                sucrette.orderInfo.splice(z2, 1);
                $(".avatar-canvas").eq(z2).remove();
            } else {
                sucrette.orderInfo.splice(z2, 1);
                $(".avatar-canvas").eq(z2).remove();
                sucrette.orderInfo.splice(z, 1);
                $(".avatar-canvas").eq(z).remove();
            };
            
        };
    };

    if (c == "wig") {
        // añadir hair
        sucrette.orderInfo.push({"category":"hair", "layer":"back", "value":"auto"});
        drawSucrette(cr, "new");
        sucrette.orderInfo.push({"category":"hair", "layer":"front", "value":"auto"});
        drawSucrette(cr, "new");
    };

    drawZIndex();
}

function resetSucrette() {
    let u = sucrette.orderInfo.filter(v => {return v.category == "underwear"});
    sucrette.orderInfo.length = 0;

    sucrette.orderInfo.push({"category":"avatar", "layer":null, "value":null});
    sucrette.orderInfo.push({"category":u[0].category, "layer":u[0].layer, "value":u[0].value});
    sucrette.orderInfo.push({"category":"hair", "layer":"back", "value":"auto"});
    sucrette.orderInfo.push({"category":"hair", "layer":"front", "value":"auto"});
    drawSucrette(cr, "load");
    drawZIndex();
}

function drawSavePopUp(w, h) {
    let type = (w == 1200) ? "fullbody" : (h == 1080) ? "face" : "background";
    if ($("#save-canvas").length == 0) {
        $("body").append(`<div id="overlay-popup"><div id="canvas-container"><canvas width="${w}" height="${h}" id="save-canvas" style="background-color:${colorPicker};"></canvas></div></div>`);
        $("#canvas-container").append(`<div class="button close"><span class="material-symbols-outlined">close</span></div>`);
        $("#canvas-container").append(`<div class="button reload"><span class="material-symbols-outlined">refresh</span></div>`);
        if (type != "background") {
            $("#canvas-container").append(`
                <div class="button bg-settings" style="background-color:${colorPicker};">
                    <input type="color" value="${colorPicker}" id="color-picker">
                    <label for="color-picker"><span class="material-symbols-outlined">palette</span></label>
                </div>`);
            $("#canvas-container").append(`<div class="button portrait"><span class="material-symbols-outlined">person</span></div>`);
            $("#canvas-container").append(`<div class="button fullbody"><span class="material-symbols-outlined">boy</span></div>`);
            $("#canvas-container").append(`<div class="button code"><span class="material-symbols-outlined">code</span></div>`);
        };

    } else {
        $("#save-canvas").attr("width", w).attr("height", h);
    };

    (w == 1200) ? drawSucrette("hd", "load") : (h == 1080) ? drawSucrette("md", "load") : drawBackgroundPopUp();
    // NORMAL -> 1200x1550
    // BIG -> 1920x1080
    // ROOM -> 1920x1296
};

// ROOM FUNCTIONS!
function drawRoomItems(c = "background") {
    $("#asng-room-item-list-panel .items-container").html("");

    const slot = room.filter(v => v.slot == c);

    // ordenar por fechas
    slot.sort((a,b) => (a.releaseDate < b.releaseDate) ? 1 : ((b.releaseDate < a.releaseDate) ? -1 : 0));

    for (b = 0; b < slot.length; b++) {
        let item = sucrette.room[c] != null ? (sucrette.room[c]).split("-")[1] : null;
        $("#asng-room-item-list-panel .items-container").append(`<div class="asng-room-item"></div>`);
        $(".asng-room-item").eq(b).append(`<div class="item ${c}"><div class="item-outline${slot[b].security == item ? " equipped" : ""}"></div></div>`);
        $(".asng-room-item .item").eq(b).append(`<div tooltipplacement="bottom"><img class="thumbnail" alt="${slot[b].name}" src="${composeRoomUrl([c], slot[b].id, slot[b].security)}"></div>`);

        if (slot[b].criteria != null) drawItemIcons(slot[b].criteria, $('.asng-room-item .item div[tooltipplacement="bottom"]').eq(b));
    };

    $(".room-items .ss-content").scrollTop(1);
    $(".room-items .ss-content").scrollTop(0);
};

function checkRoom(c, i) {
    // Chequear item
    if (sucrette.room[c] == i) {
        if (c != "background") {
            // Quitar
            drawBackgroundPopUp(".asng-room-canvas");
            sucrette.room[c] = null;
            return false;
        } else {
            return true;
        };
        
    } else {
        // Reemplazar o añadir
        sucrette.room[c] = i;
        drawBackgroundPopUp(".asng-room-canvas");
        return true;
    };
};

async function drawRoomCanvas(m = "load", p = false) {

    if (m == "load" && !p) {
        // Dibujar en preview y luego copiar
        await drawBackgroundPopUp(".asng-room-canvas.preview");
    } else {
        // Añadir / reemplazar
        await drawBackgroundPopUp(".asng-room-canvas");
    };
};

async function drawBackgroundPopUp(elmnt = "#save-canvas") {

    if (elmnt == "#save-canvas") $("#loading-layout").addClass("room");

    let ctx = document.querySelector(elmnt).getContext("2d");
    let w = ctx.canvas.width, h = ctx.canvas.height;
    let size = elmnt == "#save-canvas" ? "md" : rr;

    let img = composeRoomUrl("background", sucrette.room.background.split("-")[0], sucrette.room.background.split("-")[1], "full", size);
    let ready = await preloadIMG(img);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(ready, 0, 0, w, h);

    // temp canvas
    const e = document.createElement("canvas");
    e.width = w; e.height = h;
    const p = e.getContext("2d");

    // Filters
    let bgEffects = room.filter(v => v.security == sucrette.room.background.split("-")[1]);

    for (i = 1; i <= 5; i++) {

        ctx.globalCompositeOperation = "source-over";
        if (sucrette.room[`slot${i}`] != null) {
            p.globalCompositeOperation = "copy";
            img = composeRoomUrl(`slot${i}`, sucrette.room[`slot${i}`].split("-")[0], sucrette.room[`slot${i}`].split("-")[1], "full", size);
            ready = await preloadIMG(img);
            p.drawImage(ready, 0, 0, w, h);
            ctx.drawImage(e, 0, 0, w, h);
            p.clearRect(0, 0, w, h);

            if (re == "enabled") {
                // ambient
                p.globalCompositeOperation = "copy";
                img = composeRoomUrl(`slot${i}`, sucrette.room[`slot${i}`].split("-")[0], sucrette.room[`slot${i}`].split("-")[1], "full", size, "ambient");
                ready = await preloadIMG(img);
                p.drawImage(ctx.canvas, 0, 0, w, h);
                p.globalCompositeOperation = "multiply";
                p.fillStyle = `#${bgEffects[0].backgroundColors[rt].color1}`;
                p.fillRect(0, 0, w, h);
                p.globalCompositeOperation = "destination-atop";
                p.drawImage(ready, 0, 0, w, h);
                ctx.drawImage(e, 0, 0, w, h);
                p.clearRect(0, 0, w, h);

                // Shadow
                p.globalCompositeOperation = "copy";
                img = composeRoomUrl(`slot${i}`, sucrette.room[`slot${i}`].split("-")[0], sucrette.room[`slot${i}`].split("-")[1], "full", size, "shadow");
                ready = await preloadIMG(img);
                p.drawImage(ctx.canvas, 0, 0, w, h);
                p.globalCompositeOperation = "multiply";
                p.fillStyle = `#${bgEffects[0].backgroundColors[rt].color2}`;
                p.fillRect(0, 0, w, h);
                p.globalCompositeOperation = "destination-atop";
                p.drawImage(ready, 0, 0, w, h);
                ctx.drawImage(e, 0, 0, w, h);
                p.clearRect(0, 0, w, h);

                // light
                let itemLight = room.filter(v => {return v.security == sucrette.room[`slot${i}`].split("-")[1]});
                if (itemLight[0].light) {
                    img = composeRoomUrl(`slot${i}`, sucrette.room[`slot${i}`].split("-")[0], sucrette.room[`slot${i}`].split("-")[1], "full", size, "light");
                    ready = await preloadIMG(img);
                    ctx.globalCompositeOperation = "lighter";
                    ctx.drawImage(ready, 0, 0, w, h);
                };
            };
        };
    };

    ctx.globalCompositeOperation = "source-over";
    
    // bg light
    if (bgEffects[0].light && re == "enabled") {
        p.globalCompositeOperation = "copy";
        img = composeRoomUrl("background", sucrette.room.background.split("-")[0], sucrette.room.background.split("-")[1], "full", size, "light");
        ready = await preloadIMG(img);
        p.drawImage(ctx.canvas, 0, 0, w, h);
        p.globalCompositeOperation = "lighter";
        p.fillStyle = `#${bgEffects[0].backgroundColors[rt].colorLight}`;
        p.fillRect(0, 0, w, h);
        p.globalCompositeOperation = "destination-atop";
        p.drawImage(ready, 0, 0, w, h);
        ctx.drawImage(e, 0, 0, w, h);
        p.clearRect(0, 0, w, h);
    };

    if (elmnt.includes("asng-room-canvas")) {
        // No es popup
        let copy = null;
        let main = document.querySelector(elmnt).getContext("2d");
        if (elmnt.includes("preview")) {
            copy = document.querySelector(".asng-room-canvas").getContext("2d");
        } else {
            copy = document.querySelector(".asng-room-canvas.preview").getContext("2d");
        };

        copy.drawImage(main.canvas, 0, 0, copy.canvas.width, copy.canvas.height);
    };

    $("#loading-layout").removeClass("room");
};

// PET 
function drawPetItems() {
    $(".pet-outfits .items-container").html("");
    let p = sucrette.pet.status ? " off" : " on";
    $(".pet-outfits .items-container").append(`<div class="pet-option visibility${p}"></div>`);

    // ordenar por fechas
    pet.sort((a,b) => (a.releaseDate < b.releaseDate) ? 1 : ((b.releaseDate < a.releaseDate) ? -1 : 0));

    for (i = 0; i < pet.length; i++) {
        $(".pet-outfits .items-container").append('<div class="asng-pet-outfit-item"><div class="item"></div></div>');
        let e = (sucrette.pet.outfit != null && sucrette.pet.outfit == `${pet[i].id}-${pet[i].security}`) ? " equipped" : "";
        $(".asng-pet-outfit-item .item").eq(i).append(`<div class="item-outline${e}"></div><div tooltipplacement="bottom"><img class="thumbnail" /></div>`);
        $(".pet-outfits .thumbnail").eq(i).attr("alt", `${pet[i].name}`).attr("src", composePetUrl("hanger", pet[i].id, pet[i].security));

        if (pet[i].criteria != null) drawItemIcons(pet[i].criteria, $('.asng-pet-outfit-item .item div[tooltipplacement="bottom"]').eq(i));
    };

    pet.reverse();

    $(".pet-outfits .ss-content").scrollTop(1)
    $(".pet-outfits .ss-content").scrollTop(0);
};

function checkPet(c) {
    if (c != sucrette.pet.outfit) {
        // Reemplazar
        sucrette.pet.outfit = c;
        c = c.split("-");
        $("#pet-outfit").show();
        $("#pet-outfit").attr("src", composePetUrl("full", c[0], c[1]));
        return true;

    } else {
        // Quitar
        sucrette.pet.outfit = null;
        $("#pet-outfit").hide();
        $("#pet-outfit").removeAttr("src");
        return false;

    };
};

function drawPet() {
    if (sucrette.pet.status) {
        $("#asng-pet").show();
        $("#pet-base").show();
        if (sucrette.pet.outfit != null) {
            $("#pet-outfit").attr("src", composePetUrl("full", (sucrette.pet.outfit).split("-")[0], (sucrette.pet.outfit).split("-")[1]));
            $("#pet-outfit").show();
        } else {
            $("#pet-outfit").hide();
        };
    } else {
        $("#asng-pet").hide();
        $("#pet-base").hide();
    };
};

// CRUSH
function drawCrushPortraits() {
    $(".crush-portraits .items-container").html("");
    let c = $(".crush-list-item.current").attr("data-crush");

    let crushInfo = crush.filter(v => v.crushName == c);

    for (b = 0; b < crushInfo.length; b++) {
        let item = sucrette.crush.outfit != null ? (sucrette.crush.outfit).split("-")[1] : null;
        $("#asng-crush-outfit-list-panel .items-container").append(`<div class="asng-crush-item"></div>`);
        $(".asng-crush-item").eq(b)
            .append(`<div class="item ${c}"><div class="item-outline${crushInfo[b].security == item ? " equipped" : ""}"></div></div>`);
        $(".asng-crush-item .item").eq(b)
            .append(`<div tooltipplacement="bottom"><img class="thumbnail" alt="${crushInfo[b].name}" src="${composeCrushUrl(crushInfo[b].id, crushInfo[b].security, "portrait")}"></div>`);

        // if (crushInfo[b].criteria != null) drawItemIcons(crushInfo[b].criteria, $('.asng-room-item .item div[tooltipplacement="bottom"]').eq(b));
    };

    moveScroll(".crush-portraits .ss-content", "reset");
};

async function drawCrush(save = false) {

    let item = sucrette.crush.outfit;
    let ctx = !save ? document.getElementById("crush-canvas").getContext("2d") : document.getElementById("save-canvas").getContext("2d");
    let w = 1200, h = 1550;
    if (save) w = document.getElementById("save-canvas").getAttribute("width");

    if (item != null && w != 1920) {
        // Dibujar canvas
        let img = !save ? composeCrushUrl(item.split("-")[0], item.split("-")[1]) : composeCrushUrl(item.split("-")[0], item.split("-")[1], "full", "hd");
        ready = await preloadIMG(img);
        if (!save) ctx.clearRect(0, 0, w, h);
        ctx.drawImage(ready, 0, 0, w, h);
    } else {
        if (!save) ctx.clearRect(0, 0, w, h);
    };
};

function drawItemIcons (criteria, elmnt) {

    let icon = "";
    switch(criteria.type) {
        case "episode": icon = "episodes";break;
        case "jobTask": icon = "jobTasks";break;
        case "pack":case "loyaltyPack": icon = "bankPacks";break;
        case "calendar": icon = "calendar";break;
        case "gameEvent":case "gauge": icon = "gameEvents";break;
    };

    let macaroon = "assets/game-event/";
    if (criteria.type == "gameEvent") {
        macaroon += `gacha/${(criteria.info).split("-")[0]}/event-icon-${(criteria.info).split("-")[1]}.png`;
    } else if ((criteria.type == "gauge")) {
        macaroon += "gauge/icon.png";
    };

    elmnt.append(`<img class="locked" title="${criteria.text}" src="assets/personalization/icon/${icon}.svg">`);
    if (macaroon != "assets/game-event/") elmnt.prepend(`<div class="asng-item-macaron"><img src="${macaroon}"></div>`);

};

function closeFiltersPanel() {
    $(".filters-button").removeClass("active");
    $(".asng-filters").removeClass("active");
}

function clearInputFilter() {
    $(".filter-by-name-input input").val("");
    $(".filter-by-name-input input").addClass("empty");
    $(".filter-by-name-input .reset").removeAttr("style");
};

$(function () {

    $(".category-list-current-category").click(function() {
        var status = $("asng-category-list .list").attr("class");
        toggleCategoryMenu(status);
    });

    $(".crush-list-current-crush").click(function() {
        var status = $("asng-crush-list .list").attr("class");
        toggleCategoryMenu(status, true);
    });

    $(document).on('click', function (event) {
        if ($("asng-category-list .list.open").length == 1) {
            if (!$(event.target).closest('asng-category-list .list').length && !$(event.target).closest('.category-list-current-category').length) {
                toggleCategoryMenu("open");
            };
        } else if ($("asng-crush-list .list.open").length == 1) {
            if (!$(event.target).closest('asng-crush-list .list').length && !$(event.target).closest('.crush-list-current-crush').length) {
                toggleCategoryMenu("open", true);
            };
        };
    });

    $(".filters-button").click(function() {
        $(".filters-button").addClass("active");
        $(".asng-filters").addClass("active");
    });

    $(".backdrop").click(function() {
        closeFiltersPanel();
    });

    $(".asng-filters .asng-close-button").click(function() {
        closeFiltersPanel();
    });

    $(".filter-by-name-input input").on("input", function() {
        if ($(this).val() != "") {
            // Input filter on
            $(this).removeClass("empty");
            $(".filter-by-name-input .reset").css("opacity", 1).css("visibility", "visible");
            $(".current-category").text("Filtrado");
            $(".category-list-item").removeClass("current");
            drawCategory();

        } else {
            // Input filter off
            $(this).addClass("empty");
            $(".filter-by-name-input .reset").removeAttr("style");
            drawAvatarZone("auto", "torso");
        }
    });

    $(".filter-by-name-input .reset").click(function() {
        clearInputFilter();
        drawAvatarZone("auto", "torso");
    });

    $(".filter-by-type .type").click(function () {

        if ($(this).attr("class").includes("active")) {
            $(".filter-by-type .type").removeClass("active");
        } else {
            $(".filter-by-type .type").removeClass("active");
            $(this).addClass("active");
        };
        let c = $(".category-list-item.current").length == 1 ? $(".category-list-item.current").data("category") : "top";
        drawCategory(c);
    });

    $(".category-list-item").on('click', function() {
        clearInputFilter();
        var clase = $(this).attr("class");
        if (!clase.includes("current")) {
            $(".category-list-item.current").removeClass("current");
            $(this).addClass("current");
            $(".current-category").text(getCategoryName($(this).attr("data-category")));
            toggleCategoryMenu("open");
            drawCategory($(this).attr("data-category"));
            drawAvatarZone($(this).attr("data-category"));
        };
    });

    $(".crush-list-item").on('click', function() {
        var clase = $(this).attr("class");
        if (!clase.includes("current")) {
            $(".crush-list-item.current").removeClass("current");
            $(this).addClass("current");
            $(".current-crush").text($(this).attr("data-crush"));
            toggleCategoryMenu("open", true);
            drawCrushPortraits($(this).attr("data-crush"));
        };
    });

    $("#asng-zone-selector path").click(function() {
        clearInputFilter();
        let zone = ($(this).attr("id")).split("-")[1];
        $(".category-list-item.current").removeClass("current");
        drawAvatarZone("auto", zone);
    });

    $(".items-container").on("click", ".asng-cloth.grouped", function() {

        if (!$(this).attr("class").includes(" selected")) {
            removeDeclinationPanel();
            $(this).addClass("selected");
            $(".asng-cloth").not(".selected").addClass("not-selected");
            var item = $(this).attr("data-item");
            drawDeclinationPanel($(".asng-cloth").index(this))
            drawCategory($(".category-list-item.current").attr("data-category"), parseInt(item.split("-")[0]))

        } else {
            removeDeclinationPanel();
        };

    });

    $(".items-container").on("click", ".asng-cloth.item", function() {

        let s = $(this).find(".thumbnail").attr("src").split("/");
        s = s[s.length - 1].split(".")[0];
        let c = $(this).data("category");
        
        if (c == "eyebrows" || c == "eyes" || c == "wig" || c == "mouth" || c == "underwear" || c == "skin") {
            // Categorías únicas
            // Comprobar si el item seleccionado ya está puesto
            let clase = $(this).find(".item-outline").attr("class");
            
            if (!clase.includes("equipped") || c == "skin" || c == "wig") {
                $(".item-outline").removeClass("equipped");
            };

        } else if ($(this).parent().attr("class") == "declinations-panel") {
            $(".declinations-panel .item-outline").removeClass("equipped");

        } else {
            $(this).find(".item-outline").removeClass("equipped");
        };

        if (checkCurrentItems(s)) {
            $(this).find(".item-outline").addClass("equipped");
        };
    });

    $(".items-container").on("click", ".asng-crush-item", function() {

        let s = $(this).find(".thumbnail").attr("src").split("/");
        s = s[s.length - 1].split(".")[0];
        let c = $(this).data("crush");
        
        // Categoría única
        if ( ($(this).find(".item-outline").attr("class")).includes("equipped") ) {
            $(this).find(".item-outline").removeClass("equipped");
            // Quitar del canvas
            sucrette.crush.outfit = null;

        } else {
            $(".item-outline").removeClass("equipped");
            $(this).find(".item-outline").addClass("equipped");
            // Añadir al canvas
            sucrette.crush.outfit = s;
        };

        drawCrush();
    });

    $(".items-container").on("click", ".show-presets h2", function() {
        drawExpressions("preset");
    });

    $(".items-container").on("click", ".show-custom h2", function() {
        drawExpressions("custom");
    });

    $(".items-container").on("click", ".expression.preset", function() {
        let i = parseInt( $(this).data("index") );
        sucrette.avatar.expressionPreset = i;
        sucrette.avatar.expression.eyebrow = avatar.expressionsPresets[i][0];
        sucrette.avatar.expression.eye = avatar.expressionsPresets[i][1];
        sucrette.avatar.expression.mouth = avatar.expressionsPresets[i][2];
        drawSucrette(cr, "update_avatar");

        $(".expression.preset").removeClass("active");
        $(".expression.preset").eq(i).addClass("active");
    });

    $(".items-container").on("click", ".expression:not(.preset)", function() {
        let c = $(this).attr("class").split(" ");
        c = c[1];
        let i = $(this).data("index");
        
        sucrette.avatar.expressionPreset = "auto";
        sucrette.avatar.expression[c] = avatar.expressions[c][i];
        drawSucrette(cr, "update_avatar");

        $(`.expression.${c}`).removeClass("active");
        $(`.expression.${c}`).eq(i).addClass("active");

    });

    $(".items-container").on("click", ".close", function() {
        removeDeclinationPanel();
    });

    $(".categories").on("click", ".category", function() {
        clearInputFilter();
        var newCategory = ($(this).attr("id")).split("-")[3];

        // actualizar lista y nombre de categoria
        $(".category-list-item.current").removeClass("current");
        
        if (newCategory != "general") {
            $(`.category-list-item[data-category="${newCategory}"]`).addClass("current");
            $(".current-category").text(getCategoryName($(".category-list-item.current").attr("data-category")));

            drawCategory(newCategory);

            if (newCategory == "underwear" || newCategory == "dress" || newCategory == "waist") {
                // Conservar zona
                let currentZ = ($(".avatar-personalization").attr("class")).split(" ")[1];
                drawAvatarZone(newCategory, currentZ);
            } else {
                drawAvatarZone(newCategory);
            }

        } else {
            $(`.category-list-item[data-category="tattoo"]`).addClass("current");
            $(".current-category").text(getCategoryName($(".category-list-item.current").attr("data-category")));

            drawCategory("tattoo");
            drawAvatarZone("tattoo", "general");
        }

    });

    // move z index
    $("#asng-z-index").on("click", ".move-up", function() {
        let z = parseInt( $(this).parent().parent().data("index") );
        moveItems(z, "up");
    });

    $("#asng-z-index").on("click", ".move-down", function() {
        let z = parseInt( $(this).parent().parent().data("index") );
        moveItems(z, "down");
    });

    $("#asng-z-index").on("click", ".remove", function() {
        let z = parseInt( $(this).parent().data("index") );
        removeItem(z);
    });

    // middle menu

    $(".shortcut.cloth").click(function() {
        $(".asng-player-room").removeAttr("style");
        $(".left-panel-container").removeClass("room-panel");
        $(".asng-room-personalization").hide();
        $(".asng-sucrette-personalization").show();
        $(".shortcut").removeClass("active");
        $(".sub-link").removeClass("active");
        $(this).addClass("active");

        $(".sub-shortcuts").hide();
        $(".sub-shortcuts.cloth").show();
        $(".zoom").fadeIn(100);
        $(".save").fadeIn(100);

        $("#asng-avatar-part-color-list-panel").hide();
        $("#asng-room-item-list-panel").hide();
        $("#asng-pet-outfit-list-panel").hide();
        $("#asng-avatar-item-list-panel").show();
        $(".avatar-personalization").show();

        drawSucrette(cr, "load");
        drawZIndex();
    });

    $("#sub-link-z-index").click(function() {
        let c = $(this).attr("class");
        let a = $(".shortcut.cloth").attr("class");
        if (c.includes("active")) {
            $(this).removeClass("active");
            $("#asng-z-index").fadeOut(100);

        } else {
            $(".shortcut").removeClass("active force-clickable");
            $(".shortcut.cloth").addClass("active");
            $(".sub-link").removeClass("active");
            $(this).addClass("active");
    
            $("#asng-avatar-part-color-list-panel").hide();
            $("#asng-avatar-item-list-panel").show();
            $(".avatar-personalization").show();
            $("#asng-z-index").fadeIn(100);

            if (a.includes("force-clickable")) {
                drawSucrette(cr, "load");
            };
        }

    });

    $("#sub-link-avatar-part").click(function() {
        $(".shortcut").removeClass("active");
        $(".shortcut.cloth").addClass("active force-clickable");
        $(".sub-link").removeClass("active");
        $(this).addClass("active");

        $("#asng-avatar-item-list-panel").hide();
        $(".avatar-personalization").hide();
        $("#asng-z-index").fadeOut(100);
        $("#asng-avatar-part-color-list-panel").css("display","flex");
        drawSucrette(cr, "basics");
        drawZIndex();
    });

    $("#sub-link-delete").click(function() {
        $(".sub-link").removeClass("active");
        $("#asng-z-index").fadeOut(100);
        resetSucrette();
        drawZIndex();
    });

    $(".shortcut.room").click(function() {
        $(".shortcut").removeClass("active");
        $(this).addClass("active");
        $(".sub-shortcuts").hide();
        $(".sub-shortcuts.room").show();
        $(".left-panel-container").addClass("room-panel");

        $(".asng-sucrette-personalization").hide();
        $(".asng-room-personalization").fadeIn(100);

        $("#asng-avatar-item-list-panel").hide();
        $("#asng-avatar-part-color-list-panel").hide();
        $("#asng-pet-outfit-list-panel").hide();
        $("#asng-z-index").hide();

        $(".room-category").removeClass("active");
        $(".room-category.background").addClass("active");
        $("#asng-room-item-list-panel").show();
        $(".asng-player-room").css("filter", "blur(100px)");

        $(".zoom").hide();

        drawRoomItems();       
    });

    $("#sub-link-delete-room").click(function() {
        sucrette.room.slot1 = null;
        sucrette.room.slot2 = null;
        sucrette.room.slot3 = null;
        sucrette.room.slot4 = null;
        sucrette.room.slot5 = null;

        drawRoomCanvas("load", true);
        $(".asng-room-item .item").not(".background").find(".item-outline").removeClass("equipped");
    });

    $(".shortcut.pet").click(function() {
        $(".shortcut").removeClass("active");
        $(this).addClass("active");
        $(".sub-shortcuts").hide();
        $(".sub-shortcuts.room").hide();
        $(".asng-player-room").removeAttr("style");
        $(".asng-sucrette-personalization").show();
        $(".left-panel-container").removeClass("room-panel");

        $(".asng-room-personalization").hide();
        $(".avatar-personalization").hide();
        $("#asng-z-index").fadeOut(100);

        $("#asng-avatar-item-list-panel").hide();
        $("#asng-avatar-part-color-list-panel").hide();
        $("#asng-room-item-list-panel").hide();
        $("#asng-pet-outfit-list-panel").show();
        
        drawPetItems();
    });

    $(".shortcut.crush").click(function() {
        $(".shortcut").removeClass("active");
        $(this).addClass("active");
        $(".sub-shortcuts").hide();
        $(".sub-shortcuts.room").hide();
        $(".asng-player-room").removeAttr("style");
        $(".asng-sucrette-personalization").show();
        $(".left-panel-container").removeClass("room-panel");

        $(".asng-room-personalization").hide();
        $(".avatar-personalization").hide();
        $("#asng-z-index").fadeOut(100);

        $("#asng-avatar-item-list-panel").hide();
        $("#asng-avatar-part-color-list-panel").hide();
        $("#asng-room-item-list-panel").hide();
        $("#asng-pet-outfit-list-panel").hide();
        $("#asng-crush-outfit-list-panel").show();
        
        drawCrushPortraits();
    });

    // avatar color menu
    $(".eye-color .color").click(function() {
        sucrette.avatar.eyesColor = $(this).data("color");
        $(".eye-color .color").removeClass("equipped");
        $(this).addClass("equipped");
        drawSucrette(cr, "basics");
        drawZIndex();
    });

    $(".hair-color .color").click(function() {
        sucrette.avatar.hair = $(this).data("color");
        $(".hair-color .color").removeClass("equipped");
        $(this).addClass("equipped");
        drawSucrette(cr, "basics");
        drawZIndex();
    });

    $(".skin-color .color").click(function() {
        sucrette.avatar.skin = $(this).data("color");
        $(".skin-color .color").removeClass("equipped");
        $(this).addClass("equipped");
        drawSucrette(cr, "basics");
        drawZIndex();
    });


    // ZOOM + SAVE
    $(".asng-personalization-view .zoom").click(function() {
        let clase = $(this).attr("class");
        if (clase.includes("enabled")) {
            $(this).removeClass("enabled");
            $(".left-panel-container").fadeIn(100);
            $(".center-container").fadeIn(100);
            $(".avatar-personalization").fadeIn(100);
            
        } else {
            $(this).addClass("enabled");
            $(".left-panel-container").fadeOut(100);
            $(".center-container").fadeOut(100);
            $(".avatar-personalization").fadeOut(100);
            $("#sub-link-z-index").removeClass("active");
            $("#asng-z-index").fadeOut(100);

        };
    });

    $(".asng-personalization-view .save").click(function() {
        if ($(".room-panel").length == 0) {
            // drawSucrette
            drawSavePopUp(1200, 1550);
        } else {
            // drawRoom
            drawSavePopUp(1920, 1296);
        }
        
    });

    $('body').on("click", "#canvas-container .close", function() {
        $("#overlay-popup").remove();
        drawSucrette();
    });

    $('body').on("click", "#canvas-container .reload", function() {
        let w = parseInt($("#save-canvas").attr("width"));
        let h = parseInt($("#save-canvas").attr("height"));
        document.getElementById("save-canvas").getContext("2d").clearRect(0, 0, w, h);

        if ($(".room-panel").length == 0) {
            (w != 1920) ? drawSucrette("hd", "load") : drawSucrette("md", "load");
        } else {
            drawBackgroundPopUp("#save-canvas");
        }
    });

    
    $("body").on("change", "#color-picker", function() {
        colorPicker = $(this).val();
        $("#save-canvas").css("background-color", colorPicker);
        $("#canvas-container .button.bg-settings").css("background-color", colorPicker);
    });


    $('body').on("click", "#canvas-container .portrait", function() {
        $(this).hide();
        $("#canvas-container .fullbody").css("display", "flex");
        drawSavePopUp(1920, 1080);
    });
    $('body').on("click", "#canvas-container .fullbody", function() {
        $(this).hide();
        $("#canvas-container .portrait").css("display", "flex");
        drawSavePopUp(1200, 1550);
    });

    $('body').on("click", "#canvas-container .code span", function() {
        let clase = $(this).parent().attr("class");

        if (!clase.includes("open")) {
            let inp = $(this).parent().find("textarea");
            $(this).parent().addClass("open");

            if (inp.length == 0) {
                $(this).parent().css("width", "calc(100% - 390px)");
    
                $(this).parent().append('<textarea class="code-container" type="text" readonly></textarea><div id="generated-code-info">¡Código copiado!</div>');
                $("textarea").delay(100).fadeIn(200);
                $(".code-container").val(generateCode("ng"));
            };

        } else {
            $(this).parent().removeClass("open");
            $(this).parent().removeAttr("style");
            $(".code-container").val("").fadeOut(200).remove();
            $("#generated-code-info").remove();
        };
    });

    $("body").on("click", ".code-container", function() {
        $("#generated-code-info").show().delay(1500).fadeOut(200);
        copyCode();
    });

    // ROOM
    $('.room-category').click(function() {
        let c = ($(this).attr("class")).split(" ")[1];
        $(".room-category").removeClass("active");
        $(this).addClass("active");

        drawRoomItems(c);
    });
    
    $(".room-items").on("click", ".asng-room-item", function() {
        let item = ($(this).find("img.thumbnail").attr("src"));
        item = item.split("/");
        item = (item[item.length-1]).split(".")[0];
        let c = $(this).find(".item").attr("class").split(" ")[1];
        
        if (checkRoom(c, item)) {
            $(".asng-room-item .item-outline").removeClass("equipped");
            $(this).find(".item-outline").addClass("equipped");
        } else {
            $(".asng-room-item .item-outline").removeClass("equipped");
        }
    });

    $(".items-container").on("click", ".pet-option.visibility", function() {
        var s = $(this).attr("class").split(" ")[2];
        if (s == "on") {
            // Activar
            sucrette.pet.status = true;
            $(this).removeClass("on").addClass("off");
            drawPet();

        } else {
            // Desactivar
            sucrette.pet.status = false;
            $(this).removeClass("off").addClass("on");
            drawPet();

        };
    });
    
    $(".items-container").on("click", ".asng-pet-outfit-item", function() {
        let s = ($(this).find("img.thumbnail").attr("src")).split("/");
        s = s[s.length - 1].split(".")[0];

        $(".asng-pet-outfit-item .item-outline").removeClass("equipped");
        
        if (checkPet(s)) {
            $(this).find(".item-outline").addClass("equipped");
        };

    });

    $("#z-index-content").on("click", ".cdk-drag.item img", function() {
        let category = $(this).parent().attr("data-category");
        drawAvatarZone(category);
        $(".current-category").text( getCategoryName(category) );
        $(".category-list-item.current").removeClass("current");
        $(`.category-list-item[data-category="${category}"]`).addClass("current");
        drawCategory(category);
    });

    $(window).on("resize", function() {
        updateVWVH();
    });
});

function getCategoryName(arg) {
    if (arg == "hat") return "Sombreros";
    if (arg == "wig") return "Pelucas";
    if (arg == "eyebrows") return "Cejas";
    if (arg == "faceAccessory") return "Accesorios cara";
    if (arg == "earring") return "Pendientes";
    if (arg == "expression") return "Expresiones";
    if (arg == "makeup") return "Maquillaje";
    if (arg == "eyes") return "Ojos";
    if (arg == "mouth") return "Bocas";
    if (arg == "neckAccessory") return "Collares";
    if (arg == "top") return "Partes de arriba";
    if (arg == "dress") return "Vestidos";
    if (arg == "jacket") return "Chaquetas";
    if (arg == "waist") return "Cinturones";
    if (arg == "underwear") return "Ropa interior";
    if (arg == "gloves") return "Guantes";
    if (arg == "bag") return "Bolsos";
    if (arg == "armAccessory") return "Joyas brazo";
    if (arg == "handNailPolish") return "Esmalte manos";
    if (arg == "pants") return "Pantalones";
    if (arg == "skirt") return "Faldas";
    if (arg == "shoes") return "Zapatos";
    if (arg == "socks") return "Calcetines";
    if (arg == "legAccessory") return "Joyas piernas";
    if (arg == "footNailPolish") return "Esmalte pies";
    if (arg == "skin") return "Pieles";
    if (arg == "tattoo") return "Tatuajes";
    if (arg == "other") return "Otros";
};

function composeHangerUrl (id, e, type = "cloth", s = hr) {
    let url = `https://assets.corazondemelon-newgen.es/`;

    if (type == "cloth") {
        url += `${type}/hanger/${s}/${id}-${e}.png`;
    } else {
        url += `avatar-part/${type}/hanger/${s}/`;

        switch (type) {
            case "mouth": url+= `${id}-${e}.png`;break;
            case "eyebrows": url+= `${id}-hair_${sucrette.avatar.hair}-${e}.png`;break;
            case "eyes": url+= `${id}-eyes_${sucrette.avatar.eyesColor}-${e}.png`;break;
            case "hair": url+= `${id}.png`;break;
            case "skin": url = `https://assets.corazondemelon-newgen.es/avatar-part/${type}/full/${s}/${id}.png`;break;
        };
    }
    return url;
}

function composeCanvasUrl(t, s = cr, d, l = null) {
    let url = "https://assets.corazondemelon-newgen.es/";
    let c = ( $("#save-canvas").length == 1 && $("#save-canvas").attr("width") == 1920 ) ? "big" : "full";

    if (t == "cloth" && l == null) {
        url += `${t}/${c}/${s}/${d}.png`;
    } else {
        url += `${t}/${c}/${s}/${d.split("-")[0]}-${l}-${d.split("-")[1]}.png`;
    };

    return url;
}

function composeAvatarUrl(c, s, d, mp = null) {
    let url = "https://assets.corazondemelon-newgen.es/avatar-part/";
    let t = ( $("#save-canvas").length == 1 && $("#save-canvas").attr("width") == 1920 ) ? "big" : "full";

    if (c == "skin") {
        url += `${c}/${t}/${s}/${d}.png`;

    } else if (c == "hair") {
        url += `${c}/${t}/${s}/${d}-${mp}.png`;

    } else {
        let i = null;
        let e = [];

        if (sucrette.avatar.expressionPreset != "auto") {
            i = sucrette.avatar.expressionPreset;
            e = avatar.expressionsPresets[i];
        } else {
            e.push(sucrette.avatar.expression.eyebrow);
            e.push(sucrette.avatar.expression.eye);
            e.push(sucrette.avatar.expression.mouth);
        };
        
        if (c.includes("eyes")) {
            url += `eyes/${t}/${s}/${(d.split("-")[0])}-`;
            
            if (c.includes("skin")) {
                let b = (sucrette.avatar.customSkin == null) ? sucrette.avatar.skin : "no"; // revisar!
                url += `body_${b}-${e[1]}-${(d.split("-")[1])}.png`;
            } else {
                let ec = sucrette.avatar.eyesColor;
                url += `eyes_${ec}-${e[1]}-${(d.split("-")[1])}.png`;
            };


        } else if (c.includes("eyebrows")) {
            url += `eyebrows/${t}/${s}/${(d.split("-")[0])}-`;

            if (c.includes("skin")) {
                let b = (sucrette.avatar.customSkin == null) ? sucrette.avatar.skin : "no"; // revisar!
                url += `body_${b}-${e[0]}-${(d.split("-")[1])}.png`;
            } else {
                let hc = sucrette.avatar.hair;
                url += `hair_${hc}-${e[0]}-${(d.split("-")[1])}.png`;
            };


        } else if (c == "mouth") {
            let b = (sucrette.avatar.customSkin == null) ? sucrette.avatar.skin : "no"; // revisar!
            url += `mouth/${t}/${s}/${(d.split("-")[0])}-body_${b}-${e[2]}-${(d.split("-")[1])}.png`;
        }
    }

    return url;

}

function composeRoomUrl(c, i, e, t = "thumbnail", s = "md", f = null) {
    let url = `https://assets.corazondemelon-newgen.es/room-item/image/${t}/${s}/${i}-`;

    if (t == "thumbnail") {
        url += `${e}.jpg`;

    } else if (t == "full") {
        if (c == "background") {
            (f == null) ? url += `${rt}-${e}.jpg` : url += `${f}-${e}.png`;

        } else {
            (f == null) ? url += `${e}.png` : url += `${f}-${e}.png`;
        };
    };
    return url;
}

function composePetUrl(t, i, e) {
    if (i != null && e != null) {
        return `https://assets.corazondemelon-newgen.es/pet-outfit/${t}/${cr}/${i}-${e}.png`;
    } else {
        return `https://assets.corazondemelon-newgen.es/pet-outfit/${t}/${cr}/base.png`;
    }
}

function composeCrushUrl(i, e, t = "full", s = cr) {
    let url = 'https://assets.corazondemelon-newgen.es/npc-model/image/';
    if (t == "full" || t == "big") {
        url += `avatar/${t}/${s}/${i}-${e}.png`;
    } else { // t = portrait
        url += `dressing/${t}/${hr}/${i}-${e}.png`;
    };
    return url;
};

function fillCounter() {
    var sum = 0;
    for (i = 0; i < cloth.length; i++) {
        sum += cloth[i].variations.length;
    };

    for (a = 0; a < avatar.collections.eyebrows.length; a++) {
        sum += avatar.collections.eyebrows[a].variations.length;
    }

    for (a = 0; a < avatar.collections.eyes.length; a++) {
        sum += avatar.collections.eyes[a].variations.length;
    }

    for (a = 0; a < avatar.collections.mouth.length; a++) {
        sum += avatar.collections.mouth[a].variations.length;
    }

    $(".shortcut.cloth p.counter").text(sum);

    sum = room.length;
    $(".shortcut.room p.counter").text(sum);

    sum = pet.length;
    $(".shortcut.pet p.counter").text(sum);

    sum = crush.length;
    $(".shortcut.crush p.counter").text(sum);
}

function updateVWVH() {
    let vw = $(this).width() / 100;
    let vh = $(this).height() / 100;
    $("html").attr("style", `--asng-vw: ${vw}; --asng-vh: ${vh}; --vw: ${vw}; --vh: ${vh}`);
};

window.onbeforeunload = function () {
     return "";
};

// global variables
var cloth = [], avatar = [], room = [], pet = [], crush = [];
let colorPicker = "#000000";
