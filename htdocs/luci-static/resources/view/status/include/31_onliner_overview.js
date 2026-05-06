'use strict';
'require baseclass';
'require rpc';
'require poll';

var callOnlineUserlist = rpc.declare({
	object: 'luci.onliner',
	method: 'getOnlineUserlist',
	expect: { userlist: [] }
});

function renderUserTable(list) {
	var table = E('table', { 'class': 'table' }, [
		E('tr', { 'class': 'tr table-titles' }, [
			E('th', { 'class': 'th' }, _('Hostname')),
			E('th', { 'class': 'th' }, _('IP Address')),
			E('th', { 'class': 'th' }, _('MAC address')),
			E('th', { 'class': 'th' }, _('Interface'))
		])
	]);

	if (!Array.isArray(list) || !list.length) {
		table.appendChild(E('tr', { 'class': 'tr' }, [
			E('td', {
				'class': 'td',
				'colspan': '4'
			}, _('No online users'))
		]));

		return table;
	}

	list.sort(function(a, b) {
		return L.naturalCompare(a.ipaddr || '', b.ipaddr || '');
	});

	list.forEach(function(info) {
		if (!info.ipaddr && !info.macaddr)
			return;

		table.appendChild(E('tr', { 'class': 'tr' }, [
			E('td', { 'class': 'td' }, info.hostname || '?'),
			E('td', { 'class': 'td' }, info.ipaddr || '-'),
			E('td', { 'class': 'td' }, info.macaddr || '-'),
			E('td', { 'class': 'td' }, info.device || '-')
		]));
	});

	return table;
}

function loadOnlineData() {
	return L.resolveDefault(callOnlineUserlist(), []);
}

return baseclass.extend({
	title: _('Online User'),

	load: function() {
		return loadOnlineData();
	},

	render: function(data) {
		var container = E('div', {}, [
			renderUserTable(data)
		]);

		poll.add(function() {
			return loadOnlineData().then(function(newData) {
				var newNode = E('div', {}, [
					renderUserTable(newData)
				]);

				if (container.parentNode) {
					container.parentNode.replaceChild(newNode, container);
					container = newNode;
				}
			});
		});

		return container;
	}
});