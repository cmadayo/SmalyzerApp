Vue.component('file-upload-component', {
    template: `
    <div :class="[{'-drag': isDrag == 'new'}]"
        @dragover.prevent="checkDrag($event, 'new', true)"
　　　　 @dragleave.prevent="checkDrag($event, 'new', false)"
        @drop.prevent="onDrop">

        <div class="drop">
            <p class="drag-drop-info">ファイルをドロップ</p>
            <label for="corporation_file" class="btn btn-success">
                <input type="file" class="drop__input" style="display:none;"
                   id="corporation_file"
                   @change="onDrop"
                >
            </label>
        </div>
    </div>
    `,
    data: function() {
      return {
        isDrag: null,
        fileName: '',
      }
    },
    methods: {
      checkDrag(event, key, status){
          if (status && event.dataTransfer.types == "text/plain") {
              // only file(not html element)ファイルではなく、html要素をドラッグしてきた時は処理を中止
              return false
          }
          this.isDrag = status ? key : null
      },
      onDrop (event, key = '', image = {}) {
        event.preventDefault();
        this.isDrag = null;
        let fileList = event.target.files ? event.target.files : event.dataTransfer.files;
        // ファイルが無い時は処理を中止
        if(fileList.length == 0){
          return false;
        }
        let files    = [];
        for(let i = 0; i < fileList.length; i++){
          files.push(fileList[i]);
        }

        // var files = event.dataTransfer.files;
        let file = files.length > 0 ? files[0] : [];
        let fd   = new FormData();
        fd.append('file', file);

        $.ajax({
          url  : "http://localhost:8000/upload/",
          type : "POST",
          data : fd,
          cache       : false,
          contentType : false,
          processData : false,
          dataType    : "text"
        })
        .done(function(data) {
              // update file list
              app.$refs.flc.get_files();
            })
        .fail(function(data) {
          alert('送信に失敗しました。');
        });
      }
    }
});

Vue.component('menu-component', {
    template: `
    <div id="menu">
      <div id="username">{{username}}</div>
      <ul class="menu_items">
        <li><a class="active" href="#home">Home</a></li>
        <li><a href="#analysis">Analysis</a></li>
        <li><a href="#ready">Getting Ready...</a></li>
      </ul>
    </div>
    `,
    data: function() {
      return {
        username: 'Guest',
      }
    },
})

Vue.component('file-list-component', {
    template: `
    <div id="file_contents_area">
      <div id="toolbar_area">
        <button class="reload" v-on:click="get_files"></button>
        <button class="run" v-on:click="run_analyze(selected_file)"></button>
      </div>
      <div id="file_list_area">
        <div id="file_list_wrapper">
          <ul class="file_list">
            <li v-for="(file, index) in files">
              <input type="radio" name="radio_files" :id="'file'+index" v-model="selected_file" v-bind:value="file" v-on:change="onChange"/>
              <label :for="'file'+index">{{file}}</label>
            </li>
          </ul>
        </div>
      </div>
    </div>
    `,
    data: function() {
      return {
        files: null,
        selected_file: null,
      }
    },
    methods: {
      get_files: async function() {
        let files = await eel.python_get_files()();
        this.files = files;
      },
      run_analyze: async function(filename) {
        let result = await eel.python_run_analyze(filename)();
        console.log(result);
      },
      onChange: function() {
        app.$refs.arc.show_result(this.selected_file);
      }
    },
})

Vue.component('analysis-result-component', {
    template: `
    <div id="analysis_result_area">
      <img id="analisis_result_image" src=""/>
    </div>
    `,
    data: function() {
      return {
      }
    },
    methods: {
      show_result: function(filename) {
        let img = document.getElementById("analisis_result_image");
        // img.src = path_result;
        img.src = "/show?target=" + filename;
      },
    },
})



var app = new Vue({
  el: '#app',
})

// $(function() {
//   $('[name="radio_files"]:radio').change(function() {
//     app.$refs.arc.show_result();
//   })
// });

window.onload = function() {
  app.$refs.flc.get_files();
};
