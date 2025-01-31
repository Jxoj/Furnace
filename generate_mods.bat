@echo off
setlocal enabledelayedexpansion

:: Function to select a folder using PowerShell
set "powershellScript=Add-Type -AssemblyName 'System.Windows.Forms';$folder = (New-Object Windows.Forms.FolderBrowserDialog);if ($folder.ShowDialog() -eq 'OK') { $folder.SelectedPath }"

:: Prompt for mods folder
echo Select your mods folder:
for /f "delims=" %%i in ('powershell -command "%powershellScript%"') do set "modsFolder=%%i"

if "%modsFolder%"=="" (
    echo No mods folder selected. Exiting.
    pause
    exit /b
)

:: Prompt for output folder
echo Select your output folder:
for /f "delims=" %%i in ('powershell -command "%powershellScript%"') do set "outputFolder=%%i"

if "%outputFolder%"=="" (
    echo No output folder selected. Exiting.
    pause
    exit /b
)

:: Delete existing mods.json file (if it exists)
if exist "%outputFolder%\mods.json" (
    del "%outputFolder%\mods.json"
    echo Deleted existing mods.json
)

:: Delete all folders inside the output folder
for /d %%d in ("%outputFolder%\*") do (
    rd /s /q "%%d"
    echo Deleted folder: %%d
)

:: Initialize JSON structure
set "modsJson=%outputFolder%\mods.json"
echo { > "%modsJson%"
echo   "mods": [ >> "%modsJson%"

set jsCount=0
set modCount=0
set firstEntry=true

:: Loop through all .js files in the mods folder
for %%f in ("%modsFolder%\*.js") do (
    set /a jsCount+=1
    set "name="
    set "description="
    set "author="

    :: Extract the base file name without extension
    set "fileName=%%~nf"

    :: Display the file being processed
    echo Processing file: %%f

    :: Read the file line by line
    for /f "delims=" %%l in ('type "%%f"') do (
        set "line=%%l"

        :: Extract metadata using findstr
        echo !line! | findstr /c:"ModAPI.meta.title(" >nul && (
            for /f "tokens=2 delims=()" %%a in ("!line!") do set "name=%%~a"
        )
        echo !line! | findstr /c:"ModAPI.meta.description(" >nul && (
            for /f "tokens=2 delims=()" %%a in ("!line!") do set "description=%%~a"
        )
        echo !line! | findstr /c:"ModAPI.meta.credits(" >nul && (
            for /f "tokens=2 delims=()" %%a in ("!line!") do set "author=%%~a"
        )
    )

    :: If name is empty, use the file name as the mod's name
    if "!name!"=="" set "name=!fileName!"

    :: Check if the name already exists in mods.json
    findstr /c:"\"name\": \"!name!\"" "%modsJson%" >nul
    if !errorlevel! equ 0 (
        :: If the name exists, use the file name as the new name
        set "name=!fileName!"
    )

    :: Create a folder for the mod in the output directory
    set "modFolder=%outputFolder%\!name!"
    if not exist "!modFolder!" mkdir "!modFolder!"

    :: Copy the .js file to the mod's folder
    copy "%%f" "!modFolder!\!name!.js" >nul

    :: Replace backslashes with forward slashes in scriptUrl
    set "scriptUrl=!outputFolder:\=/!/!name!/!name!.js"

    :: Append mod entry to JSON
    if not "!firstEntry!"=="true" (
        echo , >> "%modsJson%"
    )
    echo     { >> "%modsJson%"
    echo       "name": "!name!", >> "%modsJson%"
    echo       "description": "!description!", >> "%modsJson%"
    echo       "author": "!author!", >> "%modsJson%"
    echo       "scriptUrl": "!scriptUrl!" >> "%modsJson%"
    echo     } >> "%modsJson%"
    set "firstEntry=false"
    set /a modCount+=1
)

:: Close JSON structure
echo   ] >> "%modsJson%"
echo } >> "%modsJson%"

:: Summary
echo Processing complete!
echo Total .js files read: %jsCount%
echo Total mods added: %modCount%
pause
