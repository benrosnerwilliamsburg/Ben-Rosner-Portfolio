var util = require('util')
, oops = require('../')
;

function People() {
	var storage = {};
	this.defines.value('_storage', storage);
}

function add(name, person) {
	var peeps = this._storage;
	if (peeps[name]) {
		throw new Error('Person already exists: '.concat(name));
	}
	peeps[name] = person;
	return this;
}

function list() {
	var all = [],
	peeps = this._storage;
	var keys = Object.keys(peeps);
	keys.forEach(function(k) {
		all.push({name: k, person: peeps[k]});
	});
	return all;
}

function remove(name) {
	var peeps = this._storage;
	if (peeps[name]) {
		delete peeps[name];
		return true;
	}
	return false;
}

function find(name) {
	var it = this._storage[name];
	if (typeof it !== 'undefined') {
		return { name: name, person: it };
	}
	return it;
}

People.defines
.method(add)
.method(list)
.method(find)
.method(remove)
;

var ppl = new People();
ppl.add("Bilbo", { class: "Hobbit" });
ppl.add("Dwalin", { class: "Dwarf", bread: { color: "dark", length: "mid" }});
ppl.add("Balin", { class: "Dwarf", bread: { color: "grey", length: "long", style: ["full"] }});
ppl.add("Bifor", { class: "Dwarf", bread: { color: "greying", length: "mid", style: ["two braids from labial lines"] }});
ppl.add("Bofur", { class: "Dwarf", bread: { color: "brown", length: "short", style: ["braided mustache", "chin strip"] }});
ppl.add("Bombur", { class: "Dwarf", bread: { color: "chestnut", length: "long", style: ["bushy mutton chops", "long donut from chops"] }});
ppl.add("Ori", { class: "Dwarf", bread: { color: "dark brown", length: "short", style: ["bushy chin curtain"] }});
ppl.add("Nori", { class: "Dwarf", bread: { color: "brown", length: "long", style: ["three braids","braided chin", "braided chops"] }});
ppl.add("Dori", { class: "Dwarf", bread: { color: "grey", length: "short", style: ["brigham"] }});
ppl.add("Oin", { class: "Dwarf", bread: { color: "grey", length: "mid", style: ["braided danging edge from stache to ear"] }});
ppl.add("Gloin", { class: "Dwarf", bread: { color: "grey", length: "extra long" }});
ppl.add("Fili", { class: "Dwarf", bread: { color: "brown", length: "short", style: ["door knocker"] }});
ppl.add("Kili", { class: "Dwarf", bread: { color: "dark", length: "short", style: ["mustache", "thick chin curtain"] }});
ppl.add("Thorin", { class: "Dwarf", bread: { color: "dark brown", length: "short" }});
ppl.add("Gandalf", { class: "Wisened", bread: { color: "grey", length: "legendary" }});

var all = ppl.list();
console.log("there are ".concat(all.length, " members in the party, including: ", util.inspect(ppl.find('Bilbo'))));
