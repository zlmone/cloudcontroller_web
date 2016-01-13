/*
 * Cntysoft Cloud Software Team
 *
 * @author Arvin <cntyfeng@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('App.ZhuChao.UserCenter.Ui.Project.Info',{
   extend: 'Ext.tab.Panel',
   requires : [
      'App.ZhuChao.UserCenter.Ui.Project.BaseInfo',
      'App.ZhuChao.UserCenter.Ui.Project.StageImages'
   ],
   mixins: {
      langTextProvider: 'WebOs.Mixin.RunableLangTextProvider'
   },
   /*
    * @inheritdoc
    */
   panelType: 'Info',
   /*
    * {@link WebOs.Mixin.RunableLangTextProvider#property-runableLangKey}
    *
    */
   runableLangKey : 'App.ZhuChao.UserCenter',

   mode : 1,
   fileRefs : null,
   targetLoadId : -1,
   constructor : function(config)
   {
      config = config || {};
      this.LANG_TEXT = this.GET_LANG_TEXT('UI.PROJECT.INFO');
      this.fileRefs = [];
      this.applyConstraintConfig(config);
      if(config.mode == CloudController.Const.MODIFY_MODE){
         if(!Ext.isDefined(config.targetLoadId) || !Ext.isNumber(config.targetLoadId)){
            Ext.Error.raise({
               cls : Ext.getClassName(this),
               method : 'constructor',
               msg : 'mode is modify, so you must set node id'
            });
         }
         this.targetLoadId = config.targetLoadId;
      }
      
      this.callParent([config]);
   },

   applyConstraintConfig : function(config)
   {
      Ext.apply(config, {
         border : true,
         title : this.LANG_TEXT.TITLE,
         autoScroll : true
      });
   },

   initComponent : function()
   {
      Ext.apply(this,{
         items : this.getTabPanelItemsConfig(),
         buttons : [{
            text : Cntysoft.GET_LANG_TEXT('UI.BTN.SAVE'),
            listeners : {
               click : this.saveHandler,
               scope : this
            }
         },{
            text : Cntysoft.GET_LANG_TEXT('UI.BTN.CANCEL'),
            listeners : {
               click : function()
               {
                  this.close();
               },
               scope : this
            }
         }],
         listeners : {
            afterrender : this.stateHandler,
            scope : this
         }
      });
      this.callParent();
   },

   /*
    * 渲染后首次刷新数据
    */
   stateHandler : function()
   {
      if(this.mode == CloudController.Const.NEW_MODE){
         return;
      }
      this.setLoading(this.LANG_TEXT.MSG.LOAD_PROJECT);
      //如果不是添加新的节点 那么我们需要加载数据
      this.mainPanelRef.appRef.loadProject({id : this.targetLoadId}, this.loadHandler, this);
   },
   
   loadHandler : function(response)
   {
      this.loadMask.hide();
      if(!response.status){
         Cntysoft.Kernel.Utils.processApiError(response);
      }else{
         this.responseData = response.data;
         this.setValues(response.data);
      }
   },
   
   setValues : function(values)
   {
      var panels = [
         this.baseInfoPanelRef, 
         this.stageImagesPanelRef
      ];
      var len = panels.length;
      this.fileRefs = values['fileRefs'];
      for(var i = 0; i < len; i++){
         panels[i].applyInfoValue(values);
      }
   },
   
   getTabPanelItemsConfig : function()
   {
      this.baseInfoPanelRef = new App.ZhuChao.UserCenter.Ui.Project.BaseInfo({
         mainPanelRef : this.mainPanelRef,
         infoRef : this
      });
      this.stageImagesPanelRef = new App.ZhuChao.UserCenter.Ui.Project.StageImages({
         mainPanelRef : this.mainPanelRef,
         infoRef : this
      });
      return [this.baseInfoPanelRef, this.stageImagesPanelRef];
   },
   
   saveHandler : function()
   {
      var MSG = this.LANG_TEXT.MSG,
      panels = [
         this.baseInfoPanelRef, 
         this.stageImagesPanelRef
      ];
      var len = panels.length;
      var panel;
      var valid = true;
      //先验证
      for(var i = 0; i < len; i++){
         panel = panels[i];
         if(!panel.isInfoValid()){
            this.setActiveTab(panel);
            valid = false;
         }
      }
      if(!valid){
         return;
      }
      var data = {};
      for(var i = 0; i < len; i++) {
         panel = panels[i];
         Ext.apply(data, panel.getInfoValues());
      }
      
      data['fileRefs'] = this.fileRefs;
      
      this.setLoading(MSG.SAVING);
      if(this.mode == CloudController.Const.NEW_MODE){
         this.mainPanelRef.appRef.addProject(data, function(response){
            this.loadMask.hide();
            if(!response.status){
               Cntysoft.Kernel.Utils.processApiError(response);
            }else{
               this.close();
               this.listRef.reload();
            }
         }, this);
      }else{
         this.mainPanelRef.appRef.updateProject(data, function(response){
            this.loadMask.hide();
            if(!response.status){
               Cntysoft.Kernel.Utils.processApiError(response);
            }else{
               this.close();
               this.listRef.reload();
            }
         }, this);
      }
   },

   getDefaultValues : function()
   {
      return {
         
      };
   },
   
   destroy : function()
   {
      delete this.baseInfoPanelRef;
      delete this.stageImagesPanelRef; 
      delete this.appRef;
      delete this.fileRefs;
      this.mixins.langTextProvider.destroy.call(this);
      this.callParent();
   }
});