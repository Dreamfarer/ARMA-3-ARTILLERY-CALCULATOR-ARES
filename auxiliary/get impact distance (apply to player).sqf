player addEventHandler ["Fired", {
	_this spawn 
	{
		_projectilePos = [];
		
		_playerPosition = getPosASL player;
		_projectile = _this select 6;
		
		while {alive _projectile} do {
			_pos = getPosASL _projectile;
			_projectilePos pushBackUnique _pos;
		};
		
		_impactPosition = (_projectilePos select (count _projectilePos) - 1);
		_range = _playerPosition distance _impactPosition;
		
		copyToClipboard str _range;
		player globalChat str _range + "m";
		
		player addItemToBackpack "MRAWS_HE_F";
	};
}];