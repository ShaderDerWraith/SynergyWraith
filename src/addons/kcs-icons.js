// ==UserScript==
// @name         AUTOX NI
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Skrypt automatycznie biega za graczem, wraca na kordy po zabiciu itd.
// @author       Padonim
// @match        https://tempest.margonem.pl/
// @start-at     document-idle
// @downloadURL  https://pastebin.com/raw/tXjkA4cM
// @updateURL    https://pastebin.com/raw/tXjkA4cM
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
(async (window, sleep) => {
  const initCSS = () => {
    const $container2 = $('<div id="p4d0k1ll"></div>').css({
      width: "110px",
      position: "absolute",
      "z-index": "999",
      background: "rgba(15, 15, 15, 0.85)",
      border: "1px solid orange",
      color: "white",
    });
    const $head = $('<div id="p4d0k1ll-head"></div>').css({
      width: "110px",
      height: "25px",
    });

    const $body = $('<div id="p4d0k1ll-body"></div>').css({
      width: "110px",
      height: "40px",
      "font-size": "8px",
      display: "none",
    });

    const $settings_input = $('<div id="p4d0k1ll-settings">⚙️</div>').css({
      float: "left",
    });

    const $mode_input = $('<input type="checkbox" id="mode" tabindex="0">').css(
      {
        float: "left",
      }
    );

    const $levels_input = $(
      '<input type="text" id="levels" autocomplete="off" placeholder="MIN-MAX">'
    ).css({
      width: "65px",
      height: "15px",
      background: "rgba(15, 15, 15, 0.45)",
      border: "0",
      "border-bottom": "1px dotted orange",
      color: "orange",
      "text-align": "center",
      float: "left",
    });

    const $backmode_input = $(
      '<input type="checkbox" id="backmode" tabindex="0"><small>KORDY</small>'
    ).css({
      float: "left",
    });

    const $coords_input = $(
      '<input type="text" id="coords" autocomplete="off" placeholder="X,Y">'
    ).css({
      width: "55px",
      height: "15px",
      background: "rgba(15, 15, 15, 0.45)",
      border: "0",
      "border-bottom": "1px dotted orange",
      color: "orange",
      "text-align": "center",
      float: "left",
    });

    const $automode_input = $(
      '<span style="clear: both;"></span><input type="checkbox" id="automode"><small>AUTO F</small><br>'
    ).css({
      float: "left",
      "text-align": "left",
    });

    const $follow_input = $(
      '<input type="checkbox" id="follow"><small>FOLLOW</small>'
    ).css({
      float: "left",
      "text-align": "left",
    });

    $("body").append($container2);
    $("#p4d0k1ll").append($head, $body);
    $("#p4d0k1ll-head").append($settings_input, $mode_input, $levels_input);
    $("#p4d0k1ll-body").append(
      $backmode_input,
      $coords_input,
      $automode_input,
      $follow_input
    );

    $("#p4d0k1ll-settings").click(function () {
      $("#p4d0k1ll-body").toggle("slow");
    });
  };
  window.onload = initCSS();

  GM_getValue("p4d0k1llni") ||
    GM_setValue("p4d0k1llni", JSON.stringify({ x: 0, y: 0 }));

  let padoPosition = JSON.parse(GM_getValue("p4d0k1llni"));

  document.querySelector("#p4d0k1ll").style.left = `${padoPosition.x}`;
  document.querySelector("#p4d0k1ll").style.top = `${padoPosition.y}`;
  document.querySelector("#p4d0k1ll").style.position = "absolute";

  $(document.querySelector("#p4d0k1ll")).draggable({
    stop: () => {
      padoPosition.x = document.querySelector("#p4d0k1ll").style.left;
      padoPosition.y = document.querySelector("#p4d0k1ll").style.top;
      GM_setValue("p4d0k1llni", JSON.stringify(padoPosition));

      document.querySelector("#p4d0k1ll").style.left = padoPosition.x;
      document.querySelector("#p4d0k1ll").style.top = padoPosition.y;
      document.querySelector("#p4d0k1ll").style.position = "absolute";
    },
  });

  const loadSettings = () => {
    sleep(4000);
    if (GM_getValue("status" + getCookie("mchar_id")) == true) {
      document.getElementById("mode").setAttribute("checked", "checked");
    }
    if (GM_getValue("backmode" + getCookie("mchar_id")) == true) {
      document.getElementById("backmode").setAttribute("checked", "checked");
    }
    if (GM_getValue("automode" + getCookie("mchar_id")) == true) {
      document.getElementById("automode").setAttribute("checked", "checked");
    }
    if (GM_getValue("follow" + getCookie("mchar_id")) == true) {
      document.getElementById("follow").setAttribute("checked", "checked");
    }
    if (
      GM_getValue("coords" + getCookie("mchar_id")) == null ||
      GM_getValue("coords" + getCookie("mchar_id")) == undefined
    ) {
      GM_setValue("coords" + getCookie("mchar_id"), "00,00");
    }
    if (
      GM_getValue("levels" + getCookie("mchar_id")) == null ||
      GM_getValue("levels" + getCookie("mchar_id")) == undefined
    ) {
      GM_setValue("levels" + getCookie("mchar_id"), "0-500");
    }
    document.getElementById("levels").value = GM_getValue(
      "levels" + getCookie("mchar_id")
    );
    document.getElementById("coords").value = GM_getValue(
      "coords" + getCookie("mchar_id")
    );
    console.log("[P4D0K1LL] Załadowano ustawienia.");
  };
  window.onload = loadSettings();

  document.getElementById("levels").onchange = () => {
    GM_setValue(
      "levels" + getCookie("mchar_id"),
      document.getElementById("levels").value
    );
    console.log("[P4D0K1LL] Zapisano ustawienia.");
  };

  document.getElementById("coords").onchange = () => {
    GM_setValue(
      "coords" + getCookie("mchar_id"),
      document.getElementById("coords").value
    );
    console.log("[P4D0K1LL] Zapisano ustawienia.");
  };

  document.getElementById("follow").addEventListener("click", () => {
    GM_setValue(
      "follow" + getCookie("mchar_id"),
      document.getElementById(`follow`).checked
    );
    console.log("[P4D0K1LL] Zapisano ustawienia.");
  });

  document.getElementById("mode").addEventListener("click", () => {
    GM_setValue(
      "status" + getCookie("mchar_id"),
      document.getElementById(`mode`).checked
    );
    console.log("[P4D0K1LL] Zapisano ustawienia.");
  });

  document.getElementById("automode").addEventListener("click", () => {
    GM_setValue(
      "automode" + getCookie("mchar_id"),
      document.getElementById(`automode`).checked
    );
    console.log("[P4D0K1LL] Zapisano ustawienia.");
  });

  document.getElementById("backmode").addEventListener("click", () => {
    GM_setValue(
      "backmode" + getCookie("mchar_id"),
      document.getElementById(`backmode`).checked
    );
    console.log("[P4D0K1LL] Zapisano ustawienia.");
  });

  const sendAttackReq = (id) => {
    if (new Date() / 60 - lastAttackReq < 0.3) return;
    window._g("fight&a=attack&id=" + id);
    lastAttackReq = new Date() / 60;
  };
  let lastAttackReq = new Date() / 60;

  const initX = async () => {
    while (true) {
      let targets = [];
      const getOthers = Engine.others
        .getDrawableList()
        .filter((obj) => {
          return obj.d;
        })
        .filter((obj) => {
          return (
            (obj.d.relation == 1 ||
              obj.d.relation == 3 ||
              obj.d.relation == 6) &&
            obj.d.lvl >=
              document.getElementById("levels").value.split("-")[0] &&
            obj.d.lvl <= document.getElementById("levels").value.split("-")[1]
          );
        });
      if (document.getElementById("mode").checked && Engine.map.d.pvp == 2) {
        for (const i in getOthers) {
          const emotion = getOthers[i].getOnSelfEmoList[0];
          if (emotion == undefined) {
            targets.push({
              id: getOthers[i].d.id,
              x: getOthers[i].d.x,
              y: getOthers[i].d.y,
              distance:
                Math.abs(Engine.hero.d.x - getOthers[i].d.x) +
                Math.abs(Engine.hero.d.y - getOthers[i].d.y),
            });
          } else if (
            emotion.type != "battle" &&
            emotion.type != "pvpprotected"
          ) {
            targets.push({
              id: getOthers[i].d.id,
              x: getOthers[i].d.x,
              y: getOthers[i].d.y,
              distance:
                Math.abs(Engine.hero.d.x - getOthers[i].d.x) +
                Math.abs(Engine.hero.d.y - getOthers[i].d.y),
            });
          }
        }
        if (targets != "") {
          targets = targets.sort((a, b) => (a.distance > b.distance ? 1 : -1));
          if (
            targets[0].distance > 2 &&
            document.getElementById("follow").checked
          ) {
            Engine.hero.autoGoTo({
              x: targets[0].x,
              y: targets[0].y,
            });
          } else sendAttackReq(targets[0].id);
        } else if (document.getElementById("backmode").checked) {
          if (
            Engine.hero.d.x !=
              document.getElementById("coords").value.split(",")[0] ||
            Engine.hero.d.y !=
              document.getElementById("coords").value.split(",")[1]
          ) {
            Engine.hero.autoGoTo({
              x: parseInt(
                document.getElementById("coords").value.split(",")[0]
              ),
              y: parseInt(
                document.getElementById("coords").value.split(",")[1]
              ),
            });
          }
        } else if (document.getElementById("automode").checked) {
          if (Engine.battle) {
            API.addCallbackToEvent("open_battle_window", () => {
              eval("Engine.battle.autoFight()");
            });
          }
        }
      }
      await sleep(50);
    }
  };
  window.onload = initX();
})(
  typeof unsafeWindow !== "undefined" ? unsafeWindow : window,
  (ms) => new Promise((resolve) => setTimeout(resolve, ms))
);
