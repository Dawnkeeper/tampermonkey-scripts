// ==UserScript==
// @name         EVE Online Forums Character association
// @namespace    https://utils.space/
// @version      0.1
// @description  add character association to user popups
// @author       robbilie@tweetfleet (Robert Schuh)
// @match        https://meta.eveonline.com/*
// @grant        none
// ==/UserScript==

window.addEventListener("load", function () {
    'use strict';

    var card = document.getElementById("user-card");

    new MutationObserver(mutations => mutations.forEach(mutation => {
        if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].className === "card-content") {

            var namelist = card.children[0].children[1].children[0];
            var before = namelist.children[namelist.children.length - 1];
            var name = namelist.children[0].innerText.split("\n")[0].trim();

            var profile = document.createElement("a");
                profile.target = "_blank";
                profile.href = `//gate.eveonline.com/Profile/${escape(name)}`;
                profile.innerHTML = `<i class="fa fa-external-link" />`;
            namelist.children[0].appendChild(profile);

            getCharacterAssociation(name).then(res => res.forEach(entity => {
                var type = entity.member_count !== undefined ? "Corporation" : "Alliance";
                var h = document.createElement("h2");
                    h.innerHTML = `${type}: <a href="//gate.eveonline.com/${type}/${escape(entity[type.toLowerCase() + "_name"])}" target="_blank">${entity[type.toLowerCase() + "_name"]}</a>`;
                namelist.insertBefore(h, before);
            }));
        }
    })).observe(card, { childList: true });

    function getCharacterAssociation (name) {
        return fetch(`https://esi.tech.ccp.is/latest/search/?categories=character&search=${escape(name)}&strict=true`)
        .then(res => res.json())
        .then(res => res.character[0])
        .then(id => fetch(`https://esi.tech.ccp.is/latest/characters/${id}/`))
        .then(res => res.json())
        .then(res => {
            let requests = [];
            if (res.corporation_id !== undefined) {
                requests.push(fetch(`https://esi.tech.ccp.is/latest/corporations/${res.corporation_id}/`).then(res => res.json()));
            }
            if (res.alliance_id !== undefined) {
                requests.push(fetch(`https://esi.tech.ccp.is/latest/alliances/${res.alliance_id}/`).then(res => res.json()));
            }
            return Promise.all(requests);
        });
    }

});