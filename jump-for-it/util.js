var util = (function() {
  
  var map = (function() {
    var mapPrototype = {
       get: function(key) {
        if (!this.data.hasOwnProperty(key)) {
          this.data[key] = this.newValue(key);
        }
        return this.data[key];
      }
    }
    return {
      create: function(args) {
        return Object.create(mapPrototype, {
          data: { value: {} },
          newValue: { value: args.newValue }
        });
      },
      ofArrays: function() {
        return this.create({
          newValue: function() { return []; }      
        });
      }
    }      
  })();

  function observable(obj) {
    if (!obj) {
      obj = {};
    }
    obj.listeners = map.ofArrays();
    obj.on = function(event, listener) {
      this.listeners.get(event).push(listener);
      return this;       
    }
    obj.trigger = function(event, args) {
      var listeners = this.listeners.get(event);
      listeners.forEach(function(listener) {
        listener(args);
      });
      return this;        
    }
    return obj;
  }
  
  return {
    map: map,
    observable: observable
  }
        
})();
  
