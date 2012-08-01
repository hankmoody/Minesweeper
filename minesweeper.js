

function Minesweeper(gridArgs)
{

	/// Public Methods
	
	this.Validate = function()
	{
		// Win if all the ones with
		// no mines are clicked
		
		// Win if all the ones with 
		// mines are flagged
		
		var bWinFlagged = true;
		var bWinClicked = true;
		var numFlagged = 0;
		
		for (var ck in _grid)
		{
			coord = _grid[ck];
			if (coord.isFlagged)
			{
				bWinFlagged &= coord.hasMine;
				numFlagged++;
			}
			bWinClicked &= (coord.isClicked) ? true : coord.hasMine; 
		}		
		return (bWinClicked || (bWinFlagged && (numFlagged == _mineCount)));
	}
	
	this.ShowMines = function()
	{
		for (var ck in _grid)
		{
			_SetCellClass(_grid[ck]);
		}
	}
	
	this.HideMines = function()
	{
		for (var ck in _grid)
		{
			_RemoveCellClass(_grid[ck]);
		}		
	}
	
	this.ResetGrid = function(gridMax, mineCount)
	{
		_SetupGrid(gridMax, mineCount);
	}
	
	/// Private Methods
	
	var _SetCellClass = function(coord)
	{
		if (!coord.isClicked)
		{
			var className = (coord.hasMine) ? 'cellMine' : 'cellSafe';
			$("#"+coord.key).addClass(className);
		}
	}
	
	var _RemoveCellClass = function(coord)
	{
		if (!coord.isClicked)
		{
			var className = (coord.hasMine) ? 'cellMine' : 'cellSafe';
			$("#"+coord.key).removeClass(className);
		}
	}	

	var _ProbeForMineRecursive = function(coord)
	{
		_SetCellClass(coord);
		coord.isClicked = true;
		
		// Get adjacents
		var adjInfo = _GetAdjacentCoords(coord);
		if (adjInfo.adjMineCount > 0)
		{
			var cSelector = "#" + coord.key + " SPAN";
			$(cSelector).text(adjInfo.adjMineCount);
			$(cSelector).addClass('showNum');
		}
		else
		{
			var adjKeys = adjInfo.adjKeys;
			for (var i = 0; i < adjKeys.length; i++)
			{
				_ProbeForMineRecursive(_grid[adjKeys[i]]);
			}
		}
	}

	// Returns an array of unclicked adjacent coordinates
	// with MineCount
	var _GetAdjacentCoords = function(coord)
	{
		var adjMineCount = 0;
		var adjKeys = [];
		var adjIndices = [-1, 0, 1];
		for (var i in adjIndices)
		{
			for (var j in adjIndices)
			{
				var ck = _MakeCoordsKey(coord.x+adjIndices[i], 
									    coord.y+adjIndices[j]);
			    if (ck in _grid && !_grid[ck].isClicked)
				{
					adjKeys.push(ck);
					if (_grid[ck].hasMine)
						adjMineCount++;
				}
			}
		}
		
		return {
			adjKeys: adjKeys,
			adjMineCount: adjMineCount
		};
	}

	var _GetRandomCoord = function(gridMax)
	{
		var x = _GenerateRandom(gridMax);
		var y = _GenerateRandom(gridMax);
		return new _Coords(x,y);
	}
	
	var _GenerateRandom = function(limit)
	{
		return Math.floor(Math.random() * limit);
	}

	var _Coords = function(x,y)
	{
		this.x = x;
		this.y = y;
		this.key = _MakeCoordsKey(this.x, this.y);
		this.hasMine = false;
		this.isClicked = false;
		this.isFlagged = false;
	}
	
	var _MakeCoordsKey = function(x,y)
	{
		return x + '_' + y;
	}

	var _SetupGrid = function(gridMax, mineCount)
	{
		
		_gridMax = (gridMax) ? gridMax : _gridMax;
		_mineCount = (mineCount) ? mineCount : _mineCount;
		
		// Remove existing grid
		$(_containerSelector).children().remove();
		
		_grid = new Object();
		
		// Lay down a new grid
		var mineTable = "<table id='mineGround'>";
		for (var i=0; i < _gridMax; i++)
		{
			mineTable += "<tr class='mineRow'>";
			for (var j = 0; j < _gridMax; j++)
			{
				var c = new _Coords(i,j);
				_grid[c.key] = c;
				mineTable += "<td class='mineCol' id='" + c.key + "'>" +
							 	"<span>0</span>" +
						     "</td>";
			}
			mineTable += "</tr>";
		}
		mineTable += "</table>";
		$(_containerSelector).append(mineTable);	
	
	
		// Lay down the mines
		if (_mineCount > (_gridMax * _gridMax))
			return null; // TODO: replace with error
		else
		{
			var minesLaid = 0;
			while (minesLaid < _mineCount)
			{
				var coords = _GetRandomCoord(_gridMax);
				if (!_grid[coords.key].hasMine)
				{
					_grid[coords.key].hasMine = true;
					minesLaid++;
				}	
			}
		}
	}

	/// Constructor
	
	var _grid = {};
	var _gridMax = gridArgs.gridMax;
	var _mineCount = gridArgs.mineCount;
	var _containerSelector = gridArgs.gridContainer;
	
	// Disable context menu
	document.oncontextmenu = function() {
		return false;
	}
	
	_SetupGrid();
	
	/// Events
	
	$(".mineCol").live('mousedown', function(e) {		
		var coordKey = $(this).attr('id');
		coord = _grid[coordKey];
		if (!coord.isClicked)
		{
			if (e.which == 1 && !coord.isFlagged)
			{
				if (coord.hasMine)
				{
					_SetCellClass(coord);
					gridArgs.mineTrigger();
				}
				else
					_ProbeForMineRecursive(coord);
			}
			else if (e.which == 3)
			{
				$(this).toggleClass('cellFlag');
				coord.isFlagged = !coord.isFlagged;
				return false;
			}
		}
	});
	
		
	
}
