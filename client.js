\// AreaWars v1.7.2
// от игрока just_qstn
// Все права защишены - All rights reversed





// Константы
const NEED_PLAYERS = Players.MaxCount == 1 ? 1 : 2, ADMINS_ID = "62C9E96EAE4FB4B15FFD0194E3071DDB9DE9DFD7D1F5C16AACDC54C07D66B94AB435D6ADF12B587A", BANNED_ID = "", DEFAULT_PROPS = {
	Names: ["silver", "gold", "Kills", "Deaths", "save_gold", "save_silver", "hp", "banned", "banned_hint"],
	Values: [0, 0, Players.MaxCount == 1 ? 999999999 : 0, Players.MaxCount == 1 ? 999999999 : 0, false, false, 100, false, "ебаный даун"]
}, DEFAULT_TEAM_PROPS = {
	Names: ["max_points", "points", "silver_booster", "gold_booster", "xp", "next_xp", "level"],
	Values: [125, 100, 1, 1, 0, 150, 1]
}, VESTS_VALUE = [
	200, 350, 500
],
	cmd = AreaPlayerTriggerService.Get("cmd"), silver = AreaPlayerTriggerService.Get("silver"), gold = AreaPlayerTriggerService.Get("gold"),
	capture_blue = AreaPlayerTriggerService.Get("capture_blue"), capture_red = AreaPlayerTriggerService.Get("capture_red"), shop_next = AreaPlayerTriggerService.Get("shop_next"),
	shop_prev = AreaPlayerTriggerService.Get("shop_prev"), shop_buy = AreaPlayerTriggerService.Get("shop_buy"), nuke = AreaPlayerTriggerService.Get("nuke"),
	ban = AreaPlayerTriggerService.Get("ban"), autobridge = AreaPlayerTriggerService.Get("autobridge");

// Переменные
var props = Properties.GetContext(), saved_id = props.Get("saved"), state = props.Get("state"), main_timer = Timers.GetContext().Get("main"), clearing_timer = Timers.GetContext().Get("clear"), update_timer = Timers.GetContext().Get("upd"),
	banned_id = props.Get("banned_id"), nuke_timer = Timers.GetContext().Get("nuke"), nuke_team = props.Get("nuke_team"), v_nuke = AreaViewService.GetContext().Get("nuke"), plrs = [], array_areas;

// Настройки
state.Value = "init";
banned_id.Value = "";
saved_id.Value = "";

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

// Создание команд
Teams.Add("blue", "<i><B><size=38>С</size><size=30>иние</size></B>\nareawars v1.7.2</i>", { r: 0.15, b: 0.67 });
Teams.Add("red", "<i><B><size=38>К</size><size=30>расные</size></B>\nareawars v1.7.2</i>", { r: 0.67, b: 0.15 });
Teams.Add("banned", "<i><B><size=38>З</size><size=30>абаненные</size></B>\nareawars v1.7.2</i>", { r: 0 });
let Blue = Teams.Get("blue"), Red = Teams.Get("red"), Banned = Teams.Get("banned");
Blue.Spawns.SpawnPointsGroups.Add(1);
Red.Spawns.SpawnPointsGroups.Add(2);
Banned.Spawns.CustomSpawnPoints.Add(100000, 100000, 100000, 1);
Banned.Damage.DamageIn.Value = false;

Blue.Build.BlocksSet.Value = BuildBlocksSet.Blue;
Red.Build.BlocksSet.Value = BuildBlocksSet.Red;

Teams.OnAddTeam.Add(function (t) {
	if (t == Banned) t.Properties.Get("points").Value = 10000;
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

Red.Ui.TeamProp1.Value = {
	Team: "red", Prop: "hint"
};
Blue.Ui.TeamProp2.Value = {
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
	if (state.Value == "init" || t == Banned) return;
	if (p.NickName == p.Id) {
		p.Ui.Hint.Value = "Вы забанены сервером. Причина: ваш ник это айди или уровень меньше 45";
		Banned.Add(p);
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

	const b_c = Blue.Count - (p.Team == Blue ? 1 : 0),
		r_c = Red.Count - (p.Team == Red ? 1 : 0);
	if (b_c != r_c) {
		if (b_c < r_c) Blue.Add(p);
		else if (b_c > r_c) Red.Add(p);
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
		Banned.Add(p);
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
	if (v.Name == "hint" || v.Name == "hint_all") return;
	if (v.Name == "xp" && t.Properties.Get("level").Value < 3 && v.Value >= t.Properties.Get("next_xp").Value) {
		v.Value = v.Value - t.Properties.Get("next_xp").Value;
		t.Properties.Get("level").Value++;
		return t.Properties.Get("next_xp").Value = 200 * t.Properties.Get("level").Value;
	}
	const clr = t.Properties.Get("points").Value > 75 ? "#32CD32" : t.Properties.Get("points").Value <= 75 && t.Properties.Get("points").Value > 30 ? "#FFD700" : "#FF0000",
		regen_timer = t.Timers.Get("regen").IsStarted ? "\nТаймер реген.: " + t.Timers.Get("regen").LapsedTime.toFixed() : "",
		defense_timer = t.Timers.Get("defense").IsStarted ? "\nТаймер защиты: " + t.Timers.Get("defense").LapsedTime.toFixed() : "";

	t.Properties.Get("hint").Value = "<B><color=" + clr + ">HP: " + t.Properties.Get("points").Value + "/" + t.Properties.Get("max_points").Value + "</color>\nБустеры: " + t.Properties.Get("silver_booster").Value + "/" + t.Properties.Get("gold_booster").Value + "\nLVL: " + t.Properties.Get("level").Value + ", XP: " + t.Properties.Get("xp").Value + "/" + t.Properties.Get("next_xp").Value + regen_timer + defense_timer + "</B>";
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
	this.Name = "+" + plus + " к бустеру" + (type == "gold_booster" ? " золота" : " серебра" + " (лимит " + limit + " * уровень базы)");
	this.Cost = cost;
	this.Currency = currency;
	this.Conditions = function (p) { return p.Team.Properties.Get(type).Value < limit * p.Team.Properties.Get("level").Value; };
	this.Buy = function (p) { p.Team.Properties.Get(type).Value = Math.floor((p.Team.Properties.Get(type).Value += 0.5) * 100) / 100; }
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
	new prd_Inventory("Build", 500, "silver"), new prd_Inventory("Secondary", 3000, "silver"), new prd_Inventory("Main", 1.5, "gold"), new prd_Regen(10, 15000, "silver"), new prd_Regen(30, 7, "gold"),
	new prd_Saves("silver", 50000, "silver"), new prd_Saves("gold", 40, "gold"), new prd_Vests(1, 12000), new prd_Vests(2, 50000), new prd_Vests(3, 82000), new prd_MaxPoints(5, 150, 3, "gold"), new prd_MaxPoints(15, 150, 8, "gold"),
	new prd_Boosters("silver_booster", 0.25, 3, 20000, "silver"), new prd_Boosters("silver_booster", 0.5, 3, 3, "gold"), new prd_Boosters("gold_booster", 0.1, 2, 50000, "silver"), new prd_Boosters("gold_booster", 0.2, 2, 7, "gold"),
	{
		Name: "Аптечка (+15 * уровень базы)", Currency: "gold", Cost: 7.5, Error: "Достигнут лимит очков",
		Conditions: function (p) {
			return p.Team.Properties.Get("points").Value < p.Team.Properties.Get("max_points").Value;
		},
		Buy: function (p) {
			p.Team.Properties.Get("points").Value += 35 * p.Team.Properties.Get("level").Value;
			if (p.Team.Properties.Get("points").Value > p.Team.Properties.Get("max_points").Value) p.Team.Properties.Get("points").Value = p.Team.Properties.Get("max_points").Value;
		}
	}, new prd_Autobridge("autobridge", 40000, "silver"), new prd_Autobridge("autobridge", 40000, "silver"), new prd_Autobridge("autobridge_perm", 20, "gold"), new prd_Gold(5, 25000), new prd_Gold(15, 67000), new prd_Gold(40, 130000),
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
		Name: "Старткит (нужен 3 уровень базы)", Currency: "gold", Cost: 25, Error: "Уровень базы ниже 3, или товар уже куплен",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 3 && !p.Team.Inventory.Secondary.Value;
		},
		Buy: function (p) {
			p.Team.Inventory.Secondary.Value = true;
		}
	},
	{
		Name: "Nuke (нужен 2 уровень базы)", Currency: "gold", Cost: 50, Error: "Уровень базы ниже 2, или Nuke уже активирован",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 2 && !nukeTimer.IsStarted;
		},
		Buy: function (p) {
			nukeTimer.Restart(90);
			v_nuke.Enable = true;
			nuke.Enable = true;
			nukeTeam.Value = p.Team.Id;
		}
	},
	{
		Name: "Защита 60с (нужен 2 уровень базы)", Currency: "gold", Cost: 30, Error: "Уровень базы ниже 2, или защита уже активирована",
		Conditions: function (p) {
			return p.Team.Properties.Get("level").Value >= 2 && !p.Team.Timers.Get("defense").IsStarted;
		},
		Buy: function (p) {
			if (!p.Team.Timers.Get("update").IsStarted) p.Team.Timers.Get("update").RestartLoop(1);
			p.Team.Timers.Get("defense").Restart(60);
		}
	}, new prd_Exp(7, 20000, "silver"), new prd_Exp(12, 3, "gold")
];

// Триггеры и зоны
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
	p.Properties.Get("gold_reward").Value = Number(a.Name.replace("g", "")) * 0.05;
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
			Banned.Add(plr);
			plr.Spawns.Despawn();
			const hint = "Вы zабанены игроком " + p.NickName + ". Причина: " + args[1];
			plr.Ui.Hint.Value = hint;
			plr.Properties.Get("banned_hint").Value = hint;
			p.Ui.Hint.Value = "Zaбанен " + plr.NickName + " id: " + plr.Id;
		} else {
			const b_c = Blue.Count,
				r_c = Red.Count;
			if (b_c != r_c) {
				if (b_c < r_c) Blue.Add(plr);
				else if (b_c > r_c) Red.Add(plr);
			} else Blue.Add(plr);
			plr.Properties.Get("banned").Value = false;
			p.Ui.Hint.Value = "Раzбанен " + plr.NickName + " id: " + plr.Id;;
			plr.Ui.Hint.Reset();
		}
	}
});

autobridge.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("autobridge_perm").Value) {
		p.Ui.Hint.Value = "Пермаментный автомост поставлен";
		MapEditor.SetBlock(AreaService.Get(a.Name.replace("ab", "") + "abid"), p.Team == Red ? 737 : 857);
		return p.Properties.Get("autobridge_perm").Value = false;
	}
	else if (p.Properties.Get("autobridge").Value) {
		p.Ui.Hint.Value = "Автомост поставлен";
		MapEditor.SetBlock(AreaService.Get(a.Name.replace("ab", "") + "abid"), p.Team == Red ? 33 : 28);
		return p.Properties.Get("autobridge").Value = false;
	}
	else p.Ui.Hint.Value = "Купите автомост чтобы поставить его";
});

autobridge.OnExit.Add(function (p) {
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
		red_plrs.forEach(function(plr) {if (plr.Team == Blue) red_points++;});
		blue_plrs.forEach(function(plr) {if (plr.Team == Red) blue_points++;});
	}
	if (state.Value == "third") {
		blue_points = blue_points * 2 + 1;
		red_points = red_points * 2 + 1;
	}
	Blue.Properties.Get("points").Value -= blue_points;
	Red.Properties.Get("points").Value -= red_points;
});

clearing_timer.OnTimer.Add(function () {
	try {
		if (array_areas == null) array_areas = GetAreas();
		
		for (let i = array_areas.length - 1; i > array_areas.length - 1; i--) {
			let area = AreaService.Get(array_areas[i]);
			area.Ranges.Clear();
			area.Tags.Clear();
			array_areas.pop()
		}
		if (array_areas.length > 0) {
			clearing_timer.Restart(3);
			main_timer.Restart(10);
		}
	} catch (e) { msg.Show(e.name + " " + e.message); }
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
		t.Properties.Get("hint").Value = "<B><color=" + clr + ">HP: " + t.Properties.Get("points").Value + "/" + t.Properties.Get("max_points").Value + "</color>\nБустеры: " + t.Properties.Get("silver_booster").Value + "/" + t.Properties.Get("gold_booster").Value + "\nLVL: " + t.Properties.Get("level").Value + ", XP: " + t.Properties.Get("xp").Value + "/" + t.Properties.Get("next_xp").Value + regen_timer + defense_timer + "</B>";
	}
});

Timers.OnPlayerTimer.Add(function (t) {
	let p = t.Player;
	try {
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
				p.Properties.Get("gold").Value = Math.round((p.Properties.Get("gold").Value + p.Properties.Get("gold_reward").Value * p.Team.Properties.Get("gold_booster").Value) * 100) / 100;
				break;
		}
	} catch (e) {
		msg.Show(e.name + " " + e.message);
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

function GetAreas() {
	let arr = [], e = AreaService.GetEnumerator();
	while(e.moveNext()) {
		if (!e.Current.IsEmpty) arr.push(e.Current.Name);
	}
	return arr;
}


function FirstPhase() {
	Ui.GetContext().Hint.Value = "Фаза 1";
	state.Value = "first";

	Spawns.GetContext().Enable = true;
	Blue.Spawns.Spawn();
	Red.Spawns.Spawn();


	Inventory.GetContext().Main.Value = false;
	Inventory.GetContext().Secondary.Value = false;
	Inventory.GetContext().Build.Value = false;

	main_timer.Restart(600);
}

function SecondPhase() {
	Ui.GetContext().Hint.Value = "Фаза 2";
	state.Value = "second";

	update_timer.RestartLoop(1);
	main_timer.Restart(1200);
}

function ThirdPhase() {
	Ui.GetContext().Hint.Value = "Фаза 3";
	state.Value = "third";
	main_timer.Restart(300);
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
	state.Value = "clearing";
	main_timer.Restart(10);
	Spawns.GetContext().Despawn();
	msg.Show(count);
}

function End() {
	try {
		Ui.GetContext().Hint.Value = "Конец игры" + Blue.Properties.Get("points").Value > Red.Properties.Get("points").Value ? "Синие победили</i>" : Blue.Properties.Get("points").Value == Red.Properties.Get("points").Value ? "Ничья" : "Красные победили";
		msg.Show("<i>" + (Blue.Properties.Get("points").Value > Red.Properties.Get("points").Value ? "Синие победили</i>" : Blue.Properties.Get("points").Value == Red.Properties.Get("points").Value ? "Ничья</i>" : "Красные победили</i>"), "<B><color=red>Area</color><color=blue>Wars</color> v.1.7global\nот just_qstn</B>");
		state.Value = "end";
		Damage.GetContext().DamageOut.Value = false;

		Ui.GetContext().TeamProp1.Value = {
			Team: "red", Prop: "hint_reset"
		};
		Ui.GetContext().TeamProp2.Value = {
			Team: "blue", Prop: "hint_reset"
		};
		Red.Ui.TeamProp1.Value = {
			Team: "red", Prop: "hint_reset"
		};
		Blue.Ui.TeamProp2.Value = {
			Team: "blue", Prop: "hint_reset"
		};

		main_timer.Restart(10);
	} catch (e) { msg.Show(e.name + " " + e.message) }
}
