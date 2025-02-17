!include "C:\Path\To\Your\NSIS\Include\MUI2.nsh"
!include "C:\Path\To\Your\NSIS\Include\nsDialogs.nsh"
!include "C:\Users\Dell\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1\Plugins\x86-unicode\nsDialogs.nsh"
Var Dialog

Section
    nsDialogs::Create 1018
    StrCpy $Dialog $0  ; Store the dialog handle

    nsDialogs::Text "This is a text message"

    nsDialogs::Show
SectionEnd
