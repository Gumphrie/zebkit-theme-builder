zebkit.package("ui", function(pkg, Class) {
    // alternative buttons that can be styled differently in theme
    pkg.ActionButton = Class(pkg.Button,[]);
    pkg.ReverseButton = Class(pkg.Button,[]);
});