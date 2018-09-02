//=============================================================================
// SAN_ExtendedEventPage.js
//=============================================================================
// Copyright (c) 2016 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 拡張イベントページ制御 ver1.01
 * 任意のイベントページの出現条件と出現時処理を設定します。
 * @author サンシロ https://twitter.com/rev2nym
 * @version 1.01 2016/10/27 イベントコマンド「注釈」の有無判定を修正
 * 1.00 2016/10/27 公開
 * 
 * @help
 * ■概要
 * イベントページの制御を拡張します。
 * イベントコマンド「注釈」によって
 * 任意のイベントページの出現条件と出現時処理を設定します。
 * 
 * ■書式
 * イベントページの先頭にイベントコマンド「注釈」を以下の書式で記述します。
 * 
 * <SAN_ExtendedEventPage:{
 *   "trigger":"「出現条件のスクリプト」",
 *   "handler":"「出現時処理のスクリプト」"
 * }>
 * 
 * "trigger"要素と"onOpen"要素はいずれも省略可能です。
 * ただしカンマの有無に注意してください。
 * また記号", <, >は使用できません。
 * 
 * ■出現条件の拡張
 * 前述の書式に従って条件式のスクリプト記述してください。
 * 例えば次の記述は出現条件「変数1が5のとき」を表します。
 * 
 * <SAN_ExtendedEventPage:{
 *   "trigger":"$gameVariables.value(1) === 5"
 * }>
 * 
 * なお"trigger"要素が設定されている場合
 * 通常のイベントページの出現条件は無視されます。
 * 
 * ■出現時処理の設定
 * 前述の書式に従って出現時処理のスクリプト記述してください。
 * 例えば次の記述で「このイベントを左90度回転」を表します。
 * 
 * <SAN_ExtendedEventPage:{
 *   "handler":"this.turnLeft90()"
 * }>
 * 
 * ■利用規約
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * よかったらクレジットに作者名を記載してください。
 * 
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 * 
 */

var Imported = Imported || {};
Imported.SAN_ExtendedEventPage = true;

var Sanshiro = Sanshiro || {};
Sanshiro.ExtendedEventPage = Sanshiro.ExtendedEventPage || {};
Sanshiro.ExtendedEventPage.version = '1.01';

(function() {
'use strict';

//-----------------------------------------------------------------------------
// Game_Event
//
// イベント

// メンバ変数の初期化
var _Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    _Game_Event_initMembers.call(this);
    this._exTriggres = []; // 拡張イベントページ出現条件
    this._exHandlers = []; // 拡張イベントページ出現時処理
};

// リフレッシュ
var _Game_Event_refresh = Game_Event.prototype.refresh;
Game_Event.prototype.refresh = function() {
    this.extractExtendedEventPageParameter();
    _Game_Event_refresh.call(this);
};

// 拡張イベントページパラメータの抽出
Game_Event.prototype.extractExtendedEventPageParameter = function() {
    this.event().pages.forEach(function(page, pageIndex) {
        var note = "";
        var commandIndex = 0;
        while (!!page.list[commandIndex] && (
             page.list[commandIndex].code === 108 ||
             page.list[commandIndex].code === 408))
        {
            note += page.list[commandIndex].parameters[0];
            commandIndex++;
        }
        if (note !== "") {
            var data = { note: note, meta: undefined };
            DataManager.extractMetadata(data);
            if (data.meta && data.meta.SAN_ExtendedEventPage) {
                var json = data.meta.SAN_ExtendedEventPage;
                var meta = JSON.parse(json);
                this._exTriggres[pageIndex] = meta.trigger;
                this._exHandlers[pageIndex] = meta.handler;
            }
        }
    }, this);
};

// ページ出現条件合致判定
var _Game_Event_meetsConditions = Game_Event.prototype.meetsConditions;
Game_Event.prototype.meetsConditions = function(page) {
    var pageIndex = this.event().pages.indexOf(page);
    var trigger = this._exTriggres[pageIndex];
    if (trigger) {
        return !!eval(trigger);
    } else {
        return _Game_Event_meetsConditions.call(this, page);
    }
};

// イベントページ設定のセットアップ
var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);
    eval(this._exHandlers[this._pageIndex]);
};

})(Sanshiro);
