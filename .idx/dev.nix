{pkgs}: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.python3
    pkgs.gnumake
    pkgs.gcc
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
}