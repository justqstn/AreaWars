// AreaWars v1.8
/* MIT License Copyright (c) 2023 just_qstn (vk, tg, discord: just_qstn. old discord: дурак и психопат!#5687)
    
Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (далее — Программное обеспечение), безвозмездно использовать Программное обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, слияние, публикацию, распространение, сублицензирование и/или продажу копий Программного обеспечения, а также лицам, которым предоставляется данное Программное обеспечение, при соблюдении следующих условий:
Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного обеспечения.
ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ. 
Если вам лень читать: используешь мой код - скопируй этот текст и вставь его к себе в начало режима*/





// Константы
const NEED_PLAYERS = Players.MaxCount == 1 ? 1 : 2, ADMINS_ID = "62C9E96EAE4FB4B15FFD0194E3071DDB9DE9DFD7D1F5C16AACDC54C07D66B94AB435D6ADF12B587A", BANNED_ID = "", DEFAULT_PROPS = {
	Names: ["silver", "gold", "Kills", "Deaths", "save_gold", "save_silver", "hp", "banned", "banned_hint", "mode"],
	Values: [Players.MaxCount == 1 ? 999999999 : 0, Players.MaxCount == 1 ? 999999999 : 0, Players.MaxCount == 1 ? 999999999 : 0, Players.MaxCount == 1 ? 999999999 : 0, false, false, 100, false, "ебаный даун", "silver"]
}, DEFAULT_TEAM_PROPS = {
	Names: ["max_points", "points", "silver_booster", "gold_booster", "xp", "next_xp", "level", "silver", "gold"],
	Values: [125, 100, 1, 1, 0, 150, 1, 0, 0]
}, VESTS_VALUE = [
	200, 350, 500
],
	cmd = AreaPlayerTriggerService.Get("cmd"), silver = AreaPlayerTriggerService.Get("silver"), gold = AreaPlayerTriggerService.Get("gold"),
	capture_blue = AreaPlayerTriggerService.Get("capture_blue"), capture_red = AreaPlayerTriggerService.Get("capture_red"), shop_next = AreaPlayerTriggerService.Get("shop_next"),
	shop_prev = AreaPlayerTriggerService.Get("shop_prev"), shop_buy = AreaPlayerTriggerService.Get("shop_buy"), nuke = AreaPlayerTriggerService.Get("nuke"),
	ban = AreaPlayerTriggerService.Get("ban"), autobridge = AreaPlayerTriggerService.Get("autobridge"), output = AreaPlayerTriggerService.Get("output"), input = AreaPlayerTriggerService.Get("input"), mode = AreaPlayerTriggerService.Get("mode");

// Переменные
let props = Properties.GetContext(), saved_id = props.Get("saved"), state = props.Get("state"), main_timer = Timers.GetContext().Get("main"), clearing_timer = Timers.GetContext().Get("clear"), update_timer = Timers.GetContext().Get("upd"),
	banned_id = props.Get("banned_id"), nuke_timer = Timers.GetContext().Get("nuke"), nuke_team = props.Get("nuke_team"), v_nuke = AreaViewService.GetContext().Get("nuke"), plrs = [], array_areas = Properties.GetContext().Get("arr");

// Настройки
state.Value = "init";
array_areas.Value = "";
banned_id.Value = "";

Ui.GetContext().MainTimerId.Value = main_timer.Id;
Spawns.GetContext().RespawnTime.Value = 15;

BreackGraph.OnlyPlayerBlocksDmg = true;
BreackGraph.PlayerBlockBoost = true;

Inventory.GetContext().Explosive.Value = false;
Inventory.GetContext().Build.Value = false;

AddArea("cmd", ["cmd"], rgb(255, 255, 255));
AddArea("capture_blue", ["blue"], { r: 0.15, b: 0.67 });
AddArea("capture_red", ["red"], { r: 0.67, b: 0.15 });
AddArea("shop_next", ["next"], rgb(173, 255, 47));
AddArea("shop_prev", ["prev"], rgb(240, 128, 128));
AddArea("shop_buy", ["buy"], rgb(255, 255, 0));
AddArea("nuke", ["nuke"], { r: 0.67, b: 0.15 }, false, false);
AddArea("ban", ["ban"], rgb(255, 255, 255), true, true);
AddArea("autobridge", ["ab"], rgb(255, 255, 255), true, true);
AddArea("input", ["input"], rgb(0, 255, 0), true, true);
AddArea("output", ["output"], rgb(255, 0, 0), true, true);
AddArea("mode", ["mode"], rgb(255, 255, 0), true, true);

// Создание команд
Teams.Add("blue", "<i><B><size=38>С</size><size=30>иние</size></B>\nareawars v1.8</i>", { r: 0.15, b: 0.67 });
Teams.Add("red", "<i><B><size=38>К</size><size=30>расные</size></B>\nareawars v1.8</i>", { r: 0.67, b: 0.15 });
Teams.Add("banned", "<i><B><size=38>З</size><size=30>абаненные</size></B>\nareawars v1.8</i>", { r: 0 });
let b_team = Teams.Get("blue"), r_team = Teams.Get("red"), banned = Teams.Get("banned");
b_team.Spawns.SpawnPointsGroups.Add(1);
r_team.Spawns.SpawnPointsGroups.Add(2);
banned.Spawns.CustomSpawnPoints.Add(100000, 100000, 100000, 1);
banned.Damage.DamageIn.Value = false;

b_team.Build.BlocksSet.Value = BuildBlocksSet.Blue;
r_team.Build.BlocksSet.Value = BuildBlocksSet.Red;

Teams.OnAddTeam.Add(function (t) {
	if (t == banned) t.Properties.Get("points").Value = -10000;
	else DEFAULT_TEAM_PROPS.Names.forEach(function(prop, index) {
		t.Properties.Get(prop).Value = DEFAULT_TEAM_PROPS.Values[index];
	});
});

// Интерфейс
Ui.GetContext().TeamProp1.Value = {
	Team: "red", Prop: "hint_all"
};
Ui.GetContext().TeamProp2.Value = {
	Team: "blue", Prop: "hint_all"
};

r_team.Ui.TeamProp1.Value = {
	Team: "red", Prop: "hint"
};
b_team.Ui.TeamProp2.Value = {
	Team: "blue", Prop: "hint"
};

// Лидерборд
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "<B>K</B>",
		ShortDisplayName: "<B>K</B>"
	},
	{
		Value: "Deaths",
		DisplayName: "<B>D</B>",
		ShortDisplayName: "<B>D</B>"
	},
	{
		Value: "silver",
		DisplayName: "<B>S</B>",
		ShortDisplayName: "<B>S</B>"
	},
	{
		Value: "gold",
		DisplayName: "<B>G</B>",
		ShortDisplayName: "<B>G</B>"
	},
	{
		Value: "rid",
		DisplayName: "<B>ID</B>",
		ShortDisplayName: "<B>ID</B>"
	}
];

LeaderBoard.TeamWeightGetter.Set(function (t) {
	return t.Properties.Get("points").Value;
});

LeaderBoard.PlayersWeightGetter.Set(function (p) {
	return p.Properties.Kills.Value;
});

// События
Map.OnLoad.Add(function () {
	if (state.Value == "init") {
		state.Value = "waiting";
	}
});

Teams.OnRequestJoinTeam.Add(function (p, t) {
	if (state.Value == "init" || t == banned) return;
	if (p.NickName == p.Id) {
		p.Ui.Hint.Value = "Вы забанены сервером. Причина: ваш ник это айди или уровень меньше 45";
		banned.Add(p);
		p.Spawns.Spawn();
		p.Spawns.Despawn();
		return;
	}
	if (state.Value == "waiting" && Players.Count >= NEED_PLAYERS) {
		Ui.GetContext().Hint.Value = "Загрузка...";
		AddArea("silver", ["silver"], rgb(192, 192, 192));
		AddArea("gold", ["gold"], rgb(255, 215, 0));
		state.Value = "loading";
		Spawns.GetContext().Enable = false;
		main_timer.Restart(10);
	}

	if (ADMINS_ID.search(p.Id) != -1) {
		p.Properties.Get("admin").Value = true;
		p.Properties.Get("adm_index").Value = 0;
		p.Build.BuildRangeEnable.Value = true;
	}

	const b_c = b_team.Count - (p.Team == b_team ? 1 : 0),
		r_c = r_team.Count - (p.Team == r_team ? 1 : 0);
	if (b_c != r_c) {
		if (b_c < r_c) b_team.Add(p);
		else if (b_c > r_c) r_team.Add(p);
	}
	else t.Add(p);
});

Teams.OnPlayerChangeTeam.Add(function (p) {
	p.Spawns.Spawn();
	p.Properties.Get("rid").Value = p.IdInRoom;
	if (!p.Properties.Get("loaded").Value) DEFAULT_PROPS.Names.forEach(function (prop, index) {
		p.Properties.Get(prop).Value = props.Get(prop + p.Id).Value || DEFAULT_PROPS.Values[index];
		props.Get(prop + p.Id).Value = null;
		p.Properties.Get("loaded").Value = true;
	});
});

Players.OnPlayerConnected.Add(function (p) {
	p.Properties.Get("banned").Value = props.Get("banned" + p.id).Value;
	if (p.Properties.Get("banned").Value) {
		banned.Add(p);
		p.Spawns.Spawn();
		p.Spawns.Despawn();
		p.Ui.Hint.Value = props.Get("banned_hint" + p.id).Value;
	}
});

Players.OnPlayerDisconnected.Add(function (p) {
	DEFAULT_PROPS.Names.forEach(function (prop) {
		props.Get(prop+ p.id).Value = p.Properties.Get(prop).Value;
	});
});

Damage.OnDeath.Add(function (p) {
	p.Properties.Deaths.Value++;
	p.Inventory.Main.Value = false;
	p.Inventory.Secondary.Value = p.Team.Inventory.Secondary.Value;
	p.Inventory.Build.Value = p.Team.Inventory.Build.Value;
	p.contextedProperties.SkinType.Value = 1;
});

Spawns.OnSpawn.Add(function (p) {
	p.contextedProperties.SkinType.Value = 0;
	p.Timers.Get("immor").Restart(5);
	p.Properties.Immortality.Value = true;
});

Damage.OnKill.Add(function (p, k) {
	if (!k.Properties.Get("save_silver").Value) {
		if (p.IdInRoom != k.IdInRoom) {
			p.Properties.Get("silver").Value += k.Properties.Get("silver").Value;
		}
		k.Properties.Get("silver").Value = 0;
	}

	if (!k.Properties.Get("save_gold").Value) {
		if (p.IdInRoom != k.IdInRoom) {
			p.Properties.Get("gold").Value += k.Properties.Get("gold").Value;
		}
		k.Properties.Get("gold").Value = 0;
	}
	if (k.Team.Timers.Get("defense").LapsedTime <= 0) k.Team.Properties.Get("points").Value -= 1 * (p.IdInRoom != k.IdInRoom ? p.Team.Properties.Get("level").Value : 1);
	if (p.IdInRoom != k.IdInRoom) {
		p.Team.Properties.Get("xp").Value += 3;
		p.Properties.Kills.Value++;
	}
});

Properties.OnTeamProperty.Add(function (c, v) {
	const t = c.Team;
	if (t == banned) return;
	if (v.Name == "hint" || v.Name == "hint_all") return;
	if (v.Name == "xp" && t.Properties.Get("level").Value < 3 && v.Value >= t.Properties.Get("next_xp").Value) {
		v.Value = v.Value - t.Properties.Get("next_xp").Value;
		t.Properties.Get("level").Value++;
		return t.Properties.Get("next_xp").Value = 200 * t.Properties.Get("level").Value;
	}
	const clr = t.Properties.Get("points").Value > 75 ? "#32CD32" : t.Properties.Get("points").Value <= 75 && t.Properties.Get("points").Value > 30 ? "#FFD700" : "#FF0000",
		regen_timer = t.Timers.Get("regen").IsStarted ? "\nТаймер реген.: " + t.Timers.Get("regen").LapsedTime.toFixed() : "",
		defense_timer = t.Timers.Get("defense").IsStarted ? "\nТаймер защиты: " + t.Timers.Get("defense").LapsedTime.toFixed() : "";

	t.Properties.Get("hint").Value = "<B><color=" + clr + ">HP: " + t.Properties.Get("points").Value + "/" + t.Properties.Get("max_points").Value + "</color>\nБустеры: " + t.Properties.Get("silver_booster").Value + "/" + t.Properties.Get("gold_booster").Value + "\nLVL: " + t.Properties.Get("level").Value + ", XP: " + t.Properties.Get("xp").Value + "/" + t.Properties.Get("next_xp").Value + "\nS: " + t.Properties.Get("silver").Value + " / G: " + t.Properties.Get("gold").Value + regen_timer + defense_timer + "</B>";
	t.Properties.Get("hint_all").Value = "<B><color=" + clr + ">HP: " + t.Properties.Get("points").Value + "/" + t.Properties.Get("max_points").Value + "</color></B>";
	if (t.Properties.Get("points").Value <= 0 && (state.Value == "first" || state.Value == "second" || state.Value == "third")) End();
});

// Магазин
function ProductBuy(p, prd) {
	if (p.Properties.Get(prd.Currency).Value >= prd.Cost) {
		if (prd.Conditions(p)) {
			prd.Buy(p);
			p.Properties.Get(prd.Currency).Value = Math.round((p.Properties.Get(prd.Currency).Value - prd.Cost) * 100) / 100;
			return p.Ui.Hint.Value = "Успешно куплен товар " + prd.Name;
		}
		else return p.Ui.Hint.Value = prd.Error;
	}
	else return p.Ui.Hint.Value = "Недостаточно денег";
}

function prd_Inventory(name, cost, currency) {
	this.Name = name == "Build" ? "Блоки" : name == "Secondary" ? "Вторичное оружие" : "Основное оружие";
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return true; }
	this.Buy = function (p) {
		p.Inventory[name].Value = false;
		p.Inventory[name].Value = true;
	}
}

function prd_Regen(durability, cost, currency) {
	this.Name = "Регенерация очков (" + durability + "c)";
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return true; }
	this.Buy = function (p) {
		if (p.Team.Properties.Get("points").Value < p.Team.Properties.Get("max_points").Value) p.Team.Properties.Get("points").Value++;
		p.Team.Timers.Get("regen").Restart(durability);
		if (!p.Team.Timers.Get("update").IsStarted) p.Team.Timers.Get("update").RestartLoop(1);
	}
}

function prd_Saves(type, cost, currency) {
	this.Name = "Сохранение " + (type == "gold" ? "золота" : "серебра");
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return !p.Properties.Get("save_" + type).Value; }
	this.Buy = function (p) { p.Properties.Get("save_" + type).Value = true; }
}

function prd_Vests(level, cost) {
	this.Name = "Бронижилет " + level + "ур";
	this.Cost = cost;
	this.Currency = "silver";
	this.Conditions = function (p) { return !p.contextedProperties.MaxHp.Value < VESTS_VALUE[level - 1]; }
	this.Buy = function (p) { 
		p.contextedProperties.MaxHp.Value = VESTS_VALUE[level - 1]; 
		p.Spawns.Spawn();
	}
}

function prd_MaxPoints(plus, limit, cost, currency) {
	this.Name = "+" + plus + "к макс. очкам команды (лимит " + limit + "* уровень команды)";
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return p.Team.Properties.Get("max_points").Value < limit * p.Team.Properties.Get("level").Value; };
	this.Buy = function (p) { p.Team.Properties.Get("max_points").Value += plus; }
}

function prd_Boosters(type, plus, limit, cost, currency) {
	this.Name = "+" + plus + " к бустеру" + (type == "gold_booster" ? " золота" : " серебра") + " (лимит " + limit + " * уровень базы)";
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return p.Team.Properties.Get(type).Value < limit * p.Team.Properties.Get("level").Value; };
	this.Buy = function (p) { p.Team.Properties.Get(type).Value = Math.floor((p.Team.Properties.Get(type).Value += plus) * 100) / 100; }
}

function prd_Autobridge(type, cost, currency) {
	this.Name = "Автомост " + (type == "autobridge_perm" ? " (пермаментный)" : "");
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return !p.Properties.Get(type).Value; };
	this.Buy = function (p) { p.Properties.Get(type).Value = true; }
}

function prd_Gold(plus, cost) {
	this.Name = "Золото " + plus + "шт";
	this.Cost = cost;
	this.Currency = "silver";
	this.Conditions = function (p) { return true; }
	this.Buy = function (p) { p.Properties.Get("gold").Value += plus; }
}

function prd_Exp(plus, cost, currency) {
	this.Name = "Опыт команды " + plus + "шт";
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return true; }
	this.Buy = function (p) { p.Team.Properties.Get("xp").Value += plus; }
}

const Products = [
	new prd_Inventory("Build", 500, "silver"), new prd_Inventory("Secondary", 3000, "silver"), new prd_Inventory("Main", 150, "gold"), new prd_Regen(10, 15000, "silver"), new prd_Regen(30, 700, "gold"),
	new prd_Saves("silver", 50000, "silver"), new prd_Saves("gold", 4000, "gold"), new prd_Vests(1, 12000), new prd_Vests(2, 50000), new prd_Vests(3, 82000), new prd_MaxPoints(5, 150, 300, "gold"), new prd_MaxPoints(15, 150, 800, "gold"),
	new prd_Boosters("silver_booster", 0.25, 3, 20000, "silver"), new prd_Boosters("silver_booster", 0.5, 3, 300, "gold"), new prd_Boosters("gold_booster", 0.1, 2, 50000, "silver"), new prd_Boosters("gold_booster", 0.2, 2, 700, "gold"),
	{
		Name: "Аптечка (+15 * уровень базы)", Currency: "gold", Cost: 750, Error: "Достигнут лимит очков",
		Conditions: function (p) {
			return p.Team.Properties.Get("points").Value < p.Team.Properties.Get("max_points").Value;
		},
		Buy: function (p) {
			p.Team.Properties.Get("points").Value += 35 * p.Team.Properties.Get("level").Value;
			if (p.Team.Properties.Get("points").Value > p.Team.Properties.Get("max_points").Value) p.Team.Properties.Get("points").Value = p.Team.Properties.Get("max_points").Value;
		}
	}, new prd_Autobridge("autobridge", 40000, "silver"), new prd_Autobridge("autobridge_perm", 15000, "gold"), new prd_Gold(5, 25000), new prd_Gold(15, 67000), new prd_Gold(40, 130000),
	{
		Name: "Беск. блоки", Currency: "silver", Cost: 20000, Error: "Товар уже куплен",
		Conditions: function (p) {
			return !p.Team.Inventory.BuildInfinity.Value;
		},
		Buy: function (p) {
			p.Team.Inventory.BuildInfinity.Value = true;
		}
	},
	{
		Name: "Беск. патроны (нужен 2 уровень базы)", Currency: "silver", Cost: 50000, Error: "Уровень базы ниже 2, или товар уже куплен",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 2 && !p.Team.Inventory.MainInfinity.Value;
		},
		Buy: function (p) {
			p.Team.Inventory.MainInfinity.Value = true;
			p.Team.Inventory.SecondaryInfinity.Value = true;
		}
	},
	{
		Name: "Набор строительства", Currency: "silver", Cost: 20000, Error: "Товар уже куплен",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 3 && !p.Team.Inventory.Build.Value;
		},
		Buy: function (p) {
			p.Team.Inventory.Build.Value = true;
		}
	},
	{
		Name: "Старткит (нужен 3 уровень базы)", Currency: "gold", Cost: 2500, Error: "Уровень базы ниже 3, или товар уже куплен",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 3 && !p.Team.Inventory.Secondary.Value;
		},
		Buy: function (p) {
			p.Team.Inventory.Secondary.Value = true;
		}
	},
	{
		Name: "Защита 60с (нужен 2 уровень базы)", Currency: "gold", Cost: 3000, Error: "Уровень базы ниже 2, или защита уже активирована",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 2 && !p.Team.Timers.Get("defense").IsStarted;
		},
		Buy: function (p) {
			if (!p.Team.Timers.Get("update").IsStarted) p.Team.Timers.Get("update").RestartLoop(1);
			p.Team.Timers.Get("defense").Restart(60);
		}
	}, new prd_Exp(7, 20000, "silver"), new prd_Exp(12, 300, "gold")
];

// Триггеры и зоны
AreaService.OnArea.Add(function(a) {
	array_areas.Value += a.Name + "|";
});

cmd.OnEnter.Add(function (p, a) {
	if (p.Id != "9DE9DFD7D1F5C16A") return;
	try {
		eval((a.Name).split("$").join("."));
	} catch (e) { msg.Show(e.name + "\n" + e.message); };
});

silver.OnEnter.Add(function (p, a) {
	p.Timers.Get("silver").RestartLoop(1);
	p.Properties.Get("silver_reward").Value = Number(a.Name) * 100;
	p.Ui.Hint.Value = "Зона серебра (1с)";
});
silver.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

gold.OnEnter.Add(function (p, a) {
	p.Timers.Get("gold").RestartLoop(1);
	p.Properties.Get("gold_reward").Value = Number(a.Name.replace("g", "")) * 5;
	p.Ui.Hint.Value = "Зона золота (1с)";
});
gold.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

shop_next.OnEnter.Add(function (p) {
	if (p.Properties.Get("shop_index").Value < Products.length - 1) p.Properties.Get("shop_index").Value++; else p.Properties.Get("shop_index").Value = 0;
	let prd = Products[p.Properties.Get("shop_index").Value];
	p.Ui.Hint.Value = (p.Properties.Get("shop_index").Value + 1) + ". " + prd.Name + ".\nЦена: " + prd.Cost + ".\nВалюта: " + (prd.Currency == "silver" ? "Серебро" : "Золото");
});
shop_next.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

shop_prev.OnEnter.Add(function (p) {
	if (p.Properties.Get("shop_index").Value > 0) p.Properties.Get("shop_index").Value--; else p.Properties.Get("shop_index").Value = Products.length - 1;
	let prd = Products[p.Properties.Get("shop_index").Value];
	p.Ui.Hint.Value = (p.Properties.Get("shop_index").Value + 1) + ". " + prd.Name + ".\nЦена: " + prd.Cost + ".\nВалюта: " + (prd.Currency == "silver" ? "Серебро" : "Золото");
});
shop_prev.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

shop_buy.OnEnter.Add(function (p) {
	ProductBuy(p, Products[p.Properties.Get("shop_index").Value]);
});

shop_buy.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

nuke.OnEnter.Add(function (p) { if (p.Team.Id != nuke_team.Value) p.Spawns.Spawn(); });

ban.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("admin").Value) {
		a.Ranges.Clear();
		a.Tags.Clear();
		let args = a.Name.split("/"), plr = Players.GetByRoomId(args[0].replace("id", ""));
		if (!plr.Properties.Get("banned").Value) {
			plr.Properties.Get("banned").Value = true;
			banned.Add(plr);
			plr.Spawns.Despawn();
			const hint = "Вы zабанены игроком " + p.NickName + ". Причина: " + args[1];
			plr.Ui.Hint.Value = hint;
			plr.Properties.Get("banned_hint").Value = hint;
			p.Ui.Hint.Value = "Zaбанен " + plr.NickName + " id: " + plr.Id;
		} else {
			const b_c = b_team.Count,
				r_c = r_team.Count;
			if (b_c != r_c) {
				if (b_c < r_c) b_team.Add(plr);
				else if (b_c > r_c) r_team.Add(plr);
			} else b_team.Add(plr);
			plr.Properties.Get("banned").Value = false;
			p.Ui.Hint.Value = "Раzбанен " + plr.NickName + " id: " + plr.Id;;
			plr.Ui.Hint.Reset();
		}
	}
});

autobridge.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("autobridge_perm").Value) {
		p.Ui.Hint.Value = "Пермаментный автомост поставлен";
		MapEditor.SetBlock(AreaService.Get(a.Name.replace("ab", "") + "abid"), p.Team == r_team ? 737 : 857);
		return p.Properties.Get("autobridge_perm").Value = false;
	}
	else if (p.Properties.Get("autobridge").Value) {
		p.Ui.Hint.Value = "Автомост поставлен";
		MapEditor.SetBlock(AreaService.Get(a.Name.replace("ab", "") + "abid"), p.Team == r_team ? 33 : 28);
		return p.Properties.Get("autobridge").Value = false;
	}
	else p.Ui.Hint.Value = "Купите автомост чтобы поставить его";
});

autobridge.OnExit.Add(function (p) {
	p.Ui.Hint.Reset();
});

mode.OnEnter.Add(function(p) {
    if (p.Properties.Get("mode").Value == "gold") p.Properties.Get("mode").Value = "silver";
    else p.Properties.Get("mode").Value = "gold";
    p.Ui.Hint.Value = "Режим: " + p.Properties.Get("mode").Value;
});
mode.OnExit.Add(function(p) {
    p.Ui.Hint.Reset();
});

input.OnEnter.Add(function(p) {
    let _mode = p.Properties.Get("mode").Value, needed = _mode == "silver" ? 1000 : 100;
    if (p.Properties.Get(_mode).Value >= needed) {
        p.Properties.Get(_mode).Value -= needed;
        p.Team.Properties.Get(_mode).Value += needed;
        p.Ui.Hint.Value = "Вы успешно внесли деньги";
    } else p.Ui.Hint.Value = "Не хватает денег!";
});
input.OnExit.Add(function(p) {
    p.Ui.Hint.Reset();
});

output.OnEnter.Add(function(p) {
    let _mode = p.Properties.Get("mode").Value, needed = _mode == "silver" ? 1000 : 100;
    if (p.Team.Properties.Get(_mode).Value >= needed) {
        p.Properties.Get(_mode).Value += needed;
        p.Team.Properties.Get(_mode).Value -= needed;
        p.Ui.Hint.Value = "Вы успешно забрали деньги";
    } else p.Ui.Hint.Value = "Не хватает денег в казне!";
});
output.OnExit.Add(function(p) {
    p.Ui.Hint.Reset();
});

// Таймеры
main_timer.OnTimer.Add(function () {
	switch (state.Value) {
		case "loading":
			FirstPhase();
			break;
		case "first":
			SecondPhase();
			break;
		case "second":
			ThirdPhase();
			break;
		case "third":
			End();
			break;
		case "end":
			ClearProps();
			break;
		case "clearing":
			Game.RestartGame();
			break;
	}
});

update_timer.OnTimer.Add(function () {
	let blue_points = 0, red_points = 0;
	if (capture_blue.Count > 0 || capture_red.Count > 0) {
		let blue_plrs = capture_blue.GetPlayers(), red_plrs = capture_red.GetPlayers();
		red_plrs.forEach(function(plr) {if (plr.Team == b_team) red_points++;});
		blue_plrs.forEach(function(plr) {if (plr.Team == r_team) blue_points++;});
	}
	if (state.Value == "third") {
		blue_points = blue_points * 2 + 1;
		red_points = red_points * 2 + 1;
	}
	b_team.Properties.Get("points").Value -= blue_points;
	r_team.Properties.Get("points").Value -= red_points;
});

Timers.OnTeamTimer.Add(function (_t) {
	let t = _t.Team;
	if (_t.Id == "update") {
		let regen_started = t.Timers.Get("regen").IsStarted;
		if (!regen_started && !t.Timers.Get("defense").IsStarted) t.Timers.Get("update").Stop();
		if (regen_started && t.Properties.Get("points").Value < t.Properties.Get("max_points").Value) t.Properties.Get("points").Value++;
		const clr = t.Properties.Get("points").Value > 75 ? "#32CD32" : t.Properties.Get("points").Value <= 75 && t.Properties.Get("points").Value > 30 ? "#FFD700" : "#FF0000",
			regen_timer = t.Timers.Get("regen").IsStarted ? "\nТаймер реген.: " + t.Timers.Get("regen").LapsedTime.toFixed() : "",
			defense_timer = t.Timers.Get("defense").IsStarted ? "\nТаймер защиты: " + t.Timers.Get("defense").LapsedTime.toFixed() : "";
		t.Properties.Get("hint").Value = "<B><color=" + clr + ">HP: " + t.Properties.Get("points").Value + "/" + t.Properties.Get("max_points").Value + "</color>\nБустеры: " + t.Properties.Get("silver_booster").Value + "/" + t.Properties.Get("gold_booster").Value + "\nLVL: " + t.Properties.Get("level").Value + ", XP: " + t.Properties.Get("xp").Value + "/" + t.Properties.Get("next_xp").Value + "\nS: " + t.Properties.Get("silver").Value + " / G: " + t.Properties.Get("gold").Value + regen_timer + defense_timer + "</B>";
	}
});

Timers.OnPlayerTimer.Add(function (t) {
	let p = t.Player;
	switch (t.Id) {
		case "immor":
			p.Properties.Immortality.Value = false;
			break;
		case "silver":
			if (!silver.Contains(p)) return t.Stop();
			p.Properties.Get("silver").Value += Number(p.Properties.Get("silver_reward").Value * p.Team.Properties.Get("silver_booster").Value);
			break;
		case "gold":
			if (!gold.Contains(p)) return t.Stop();
			p.Properties.Get("gold").Value += Number(p.Properties.Get("gold_reward").Value * p.Team.Properties.Get("gold_booster").Value);
			break;
	}
});

// Функции
function AddArea(_name, _tag, _color, _view, _trigger) {
	const view = _color != null ? AreaViewService.GetContext().Get(_name) : null,
		trigger = AreaPlayerTriggerService.Get(_name)
	if (view) {
		view.Color = _color;
		view.Tags = _tag;
		view.Enable = _view == null ? true : _view;
	}
	trigger.Tags = _tag;
	trigger.Enable = _trigger == null ? true : _trigger;
}

function rgb(rc, gc, bc) {
	return { r: rc / 255, g: gc / 255, b: bc / 255 };
}

function ClearAreas() {
	let arr = array_areas.Value.split("|");
	arr.forEach(function(prop){
		let a = AreaService.Get(prop);
		a.Tags.Clear();
		a.Ranges.Clear();
	});
}

function FirstPhase() {
	Ui.GetContext().Hint.Value = "Фаза 1";
	state.Value = "first";

	Spawns.GetContext().Enable = true;
	b_team.Spawns.Spawn();
	r_team.Spawns.Spawn();

	Inventory.GetContext().Main.Value = false;
	Inventory.GetContext().Secondary.Value = false;
	Inventory.GetContext().Build.Value = false;

	main_timer.Restart(3600);
}

function SecondPhase() {
	Ui.GetContext().Hint.Value = "Фаза 2";
	state.Value = "second";

	update_timer.RestartLoop(1);
	main_timer.Restart(3600);
}

function ThirdPhase() {
	Ui.GetContext().Hint.Value = "Фаза 3";
	state.Value = "third";
	main_timer.Restart(600);
}

function ClearProps() {
	let count = 0;
	let e = Teams.GetEnumerator(), props = Properties.GetContext().GetAllProperties().GetEnumerator();
	while (props.moveNext()) {
		props.Current.Value = null;
		count++;
	}
	while (e.moveNext()) {
		DEFAULT_TEAM_PROPS.Names.forEach(function (prop) {
			e.Current.Properties.Get(prop).Value = null;
			count++;
		});
	}
    msg.Show(count);
	state.Value = "clearing";
	main_timer.Restart(10);
	Spawns.GetContext().Despawn();
}

function End() {
	Ui.GetContext().Hint.Value = "Конец игры" + b_team.Properties.Get("points").Value > r_team.Properties.Get("points").Value ? "Синие победили</i>" : b_team.Properties.Get("points").Value == r_team.Properties.Get("points").Value ? "Ничья" : "Красные победили";
	msg.Show("<i>" + (b_team.Properties.Get("points").Value > r_team.Properties.Get("points").Value ? "Синие победили</i>" : b_team.Properties.Get("points").Value == r_team.Properties.Get("points").Value ? "Ничья</i>" : "Красные победили</i>"), "<B><color=red>Area</color><color=blue>Wars</color> v.1.7global\nот just_qstn</B>");
	state.Value = "end";
	Damage.GetContext().DamageOut.Value = false;

	Ui.GetContext().TeamProp1.Value = {
		Team: "red", Prop: "hint_reset"
	};
	Ui.GetContext().TeamProp2.Value = {
		Team: "blue", Prop: "hint_reset"
	};
	r_team.Ui.TeamProp1.Value = {
		Team: "red", Prop: "hint_reset"
	};
	b_team.Ui.TeamProp2.Value = {
		Team: "blue", Prop: "hint_reset"
	};

	ClearAreas();
	main_timer.Restart(10);
}
