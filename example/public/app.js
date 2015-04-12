$(document).ready(function () {
  $('#tree')
        .jstree({
          'core' : {
            'data' : {
              "url" : "/readdir/",
              'data' : function (node) {
                return { 'id' : node.id };
              }
            },
            'check_callback' : function(o, n, p, i, m) {
              if(m && m.dnd && m.pos !== 'i') { return false; }
              if(o === "move_node" || o === "copy_node") {
                if(this.get_node(n).parent === this.get_node(p).id) { return false; }
              }
              return true;
            },
            'themes' : {
              'responsive' : false,
              'variant' : 'small',
              'stripes' : true
            }
          },
          'sort' : function(a, b) {
            return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
          },
          'contextmenu' : {
            'items' : function(node) {
              var tmp = $.jstree.defaults.contextmenu.items();
              delete tmp.create.action;
              tmp.create.label = "New";
              tmp.create.submenu = {
                "create_folder" : {
                  "separator_after" : true,
                  "label"       : "Folder",
                  "action"      : function (data) {
                    var inst = $.jstree.reference(data.reference),
                      obj = inst.get_node(data.reference);
                    inst.create_node(obj, { type : "default" }, "last", function (new_node) {
                      setTimeout(function () { inst.edit(new_node); },0);
                    });
                  }
                },
                "create_file" : {
                  "label"       : "File",
                  "action"      : function (data) {
                    var inst = $.jstree.reference(data.reference),
                      obj = inst.get_node(data.reference);
                    inst.create_node(obj, { type : "file" }, "last", function (new_node) {
                      setTimeout(function () { inst.edit(new_node); },0);
                    });
                  }
                }
              };
              delete tmp.ccp;
              return tmp;
            }
          },
          'unique' : {
            'duplicate' : function (name, counter) {
              return name + ' ' + counter;
            }
          },
          'types' : {
            'default' : {  'icon' : 'folder' },
            'file' : { 'valid_children' : [], 'icon' : 'file' }
          },
          'plugins' : ['state','dnd', 'types', 'sort', 'contextmenu','unique']
        })
        .on('delete_node.jstree', function (e, data) {
          $.get('delete_node', { 'id' : data.node.id })
            .fail(function () {
              data.instance.refresh();
            });
        })
        .on('create_node.jstree', function (e, data) {
          $.get('create_node', { 'type' : data.node.type, 'id' : data.node.parent, 'text' : data.node.text })
            .done(function (newId) {
              data.instance.set_id(data.node, newId);
            })
            .fail(function () {
              data.instance.refresh();
            });
        })
        .on('rename_node.jstree', function (e, data) {
          $.get('rename_node', { 'id' : data.node.id, 'text' : data.text })
            .done(function (newId) {
              data.instance.set_id(data.node, newId);
            })
            .fail(function () {
              data.instance.refresh();
            });
        })
        .on('move_node.jstree', function (e, data) {
          $.get('move_node', { 'id' : data.node.id, 'parent' : data.parent })
            .done(function (d) {
              //data.instance.load_node(data.parent);
              data.instance.refresh();
            })
            .fail(function () {
              data.instance.refresh();
            });
        });
        
  $(document).on('dblclick', '#tree .jstree-anchor', function () {
    var $el = $(this);
    var fileName = $el.attr('id');
    if (fileName) {
      $.get('/getfilecontent', {filename: fileName})
      .success(function (res) {
        console.log(res);
      })
      .error(function (err) {
        console.log(err);
      });
    }
  });

});
