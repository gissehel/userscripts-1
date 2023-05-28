#!/usr/bin/env bash

this_script="${0}"
this_dir=$(readlink -f $(dirname "${this_script}"))
script_name=$(basename "${this_script}")

version="dev"
author="me"
homepage="https://github.com/${author}/userscripts"
support="https://github.com/${author}/userscripts/issues"

author_explicit="0"
homepage_explicit="0"
support_explicit="0"

force="0"

this_script_rc="${this_dir}/.manage.rc"

[ -f "${this_script_rc}" ] && source "${this_script_rc}" || {
    echo "author=${author}" > "${this_script_rc}"
    echo "homepage=${homepage}" >> "${this_script_rc}"
    echo "support=${support}" >> "${this_script_rc}"
}

help() {
    echo "${script_name} ACTION [OPTIONS]"
    echo ""
    echo "  ACTIONS:"
    echo ""
    echo "    create DIRNAME SCRIPTNAME        create a new userscript name SCRIPTNAME in DIRNAME"
    echo "    createcss DIRNAME SCRIPTNAME     create a new userstyle name SCRIPTNAME in DIRNAME"
    echo "    config                           configure the tool"
    echo "    make_dist                        create a distribution dir"
    echo "    clean_dist                       clean distribution dir"
    echo ""
    echo "  OPTIONS"
    echo "    -a, --author AUTHOR              use AUTHOR for author name"
    echo "    -h, --homepage HOMEPAGE          use HOMEPAGE for homepage url"
    echo "    -s, --support SUPPORT            use SUPPORT for support url (issues)"
    echo "    -f, --force                      force to create scripts/styles even if they exist"
    echo "    -v, --set-version VERSION        provide version VERSION (for dist)"
    echo ""
}

message() {
    echo "${@}"
}

error() {
    echo "ERROR: ${@}" >&2
}

fail () {
    error "${@}"
    echo ""
    help
    exit 1
}

action=""
dirname=""
scriptname=""
error=""

create_script() {
    scriptfilename="src/${dirname}/${scriptname}.user.js"
    [ -f "${scriptfilename}" ] && [ "${force}" == "0" ] && fail "Script ${scriptfilename} already exists"
    mkdir -p "$(dirname "${scriptfilename}")"
    echo "// ==UserScript==" > "${scriptfilename}"
    echo "// @name         ${scriptname}" >> "${scriptfilename}"
    echo "// @namespace    ${homepage}" >> "${scriptfilename}"
    echo "// @version      0.0.0" >> "${scriptfilename}"
    echo "// @description  ${scriptname}" >> "${scriptfilename}"
    echo "// @author       ${author}" >> "${scriptfilename}"
    echo "// @homepage     ${homepage}" >> "${scriptfilename}"
    echo "// @supportURL   ${support}" >> "${scriptfilename}"
    echo "// @match        https://example.com/*" >> "${scriptfilename}"
    echo "// @match        https://example.com/*" >> "${scriptfilename}"
    echo "// @grant        none" >> "${scriptfilename}"
    echo "// ==/UserScript==" >> "${scriptfilename}"
    echo "" >> "${scriptfilename}"
    echo "(() => {" >> "${scriptfilename}"
    echo "    const script_name = GM_info?.script?.name || 'no-name'" >> "${scriptfilename}"
    echo "    const script_version = GM_info?.script?.version || 'no-version'" >> "${scriptfilename}"
    echo "    const script_id = \`\${script_name} \${script_version}\`" >> "${scriptfilename}"
    echo "    console.log(\`Begin - \${script_id}\`)" >> "${scriptfilename}"
    echo "" >> "${scriptfilename}"
    echo "" >> "${scriptfilename}"
    echo "    console.log(\`End - \${script_id}\`)" >> "${scriptfilename}"
    echo "})()" >> "${scriptfilename}"
}

create_style() {
    stylefilename="src/${dirname}/${scriptname}.user.css"
    [ -f "${stylefilename}" ] && [ "${force}" == "0" ] && fail "Style ${stylefilename} already exists"
    mkdir -p "$(dirname "${stylefilename}")"
    echo "/* ==UserStyle==" > "${stylefilename}"
    echo "@name           ${scriptname}" >> "${stylefilename}"
    echo "@namespace      ${homepage}" >> "${stylefilename}"
    echo "@version        0.0.0" >> "${stylefilename}"
    echo "@description    ${scriptname}" >> "${stylefilename}"
    echo "@author         ${author}" >> "${stylefilename}"
    echo "==/UserStyle== */" >> "${stylefilename}"
    echo "" >> "${stylefilename}"
    echo "@-moz-document domain("example.com") {" >> "${stylefilename}"
    echo "" >> "${stylefilename}"
    echo "}" >> "${stylefilename}"
}

make_dist() {
    dist_dir="${this_dir}/dist"
    tmp_dir="${this_dir}/tmp"
    rm -rf "${dist_dir}" "${tmp_dir}"
    mkdir -p "${dist_dir}"
    mkdir -p "${tmp_dir}"
    echo "{" > "${tmp_dir}/userscripts.json"
    cd src
    for script in $(find * | grep -E ".user.js$"); do mkdir -p "${dist_dir}/$(dirname "${script}")"; cp -f "${script}" "${dist_dir}/${script}"; echo "\"${script}\":"; content="$(cat "${script}" | perl -ape 's/\r//g;' | grep -ozP '(?s)// ==UserScript==\n\K.*?(?=\n// ==/UserScript==)' 2>/dev/null | perl -ape 's{^// @([^\s+]*)\s*(.*?)$}{  [\"$1\",\"$2\"],}' | tr -d '\0'; echo "")"; echo "["; echo "${content}"; echo "[\"type\",\"script\"]],"; done >> "${tmp_dir}/userscripts.json"
    for script in $(find * | grep -E ".user.css$"); do mkdir -p "${dist_dir}/$(dirname "${script}")"; cp -f "${script}" "${dist_dir}/${script}"; echo "\"${script}\":"; content="$(cat "${script}"  | perl -ape 's/\r//g;' | grep -ozP '(?s)/* ==UserStyle==\n\K.*?(?=\n==/UserStyle==)' 2>/dev/null | perl -ape 's{^@([^\s+]*)\s*(.*?)$}{  [\"$1\",\"$2\"],}' | tr -d '\0'; echo "")"; echo "["; echo "${content}"; echo "[\"type\",\"style\"]],"; done >> "${tmp_dir}/userscripts.json"
    cd ..
    echo "\"\": null}" >> "${tmp_dir}/userscripts.json"
    echo "{\"version\":\"${version}\"}" > "${dist_dir}/version.json"
    cat "${tmp_dir}/userscripts.json" | jq -c "" | perl -ape 's{,null]}{]}g; s/,"":null}/}/g;' > "${dist_dir}/userscripts.json"
    cp -f "website/index.html" "website/userscripts.js" "${dist_dir}/"
    touch "${dist_dir}/.nojekyll"
}

clean_dist() {
    dist_dir="${this_dir}/dist"
    tmp_dir="${this_dir}/tmp"
    rm -rf "${dist_dir}" "${tmp_dir}"
}

config() {
    if [ "${author_explicit}" == "0" ]
    then
        read -p "Author ? [${author}] >" new_author
        [ -n "${new_author}" ] && author="${new_author}"
        author_explicit="1"
    fi
    if [ "${homepage_explicit}" == "0" ]
    then
        read -p "Author ? [${homepage}] >" new_homepage
        [ -n "${new_homepage}" ] && homepage="${new_homepage}"
        homepage_explicit="1"
    fi
    if [ "${support_explicit}" == "0" ]
    then
        read -p "Author ? [${support}] >" new_support
        [ -n "${new_support}" ] && support="${new_support}"
        support_explicit="1"
    fi
    echo "author=\"${author}\"" > "${this_script_rc}"
    echo "homepage=\"${homepage}\"" >> "${this_script_rc}"
    echo "support=\"${support}\"" >> "${this_script_rc}"
}


param="${1}"
shift

while [ -n "${param}" ]
do
    case "${param}" in
        create)
            [ -n "${1}" ] && [ -n "${2}" ] && {
                action="create_script"
                dirname="${1}"
                scriptname="${2}"
                shift
                shift
            } || {
                error="Should provide DIRNAME and SCRIPTNAME for [${param}]"
            }
            ;;

        createcss)
            [ -n "${1}" ] && [ -n "${2}" ] && {
                action="create_style"
                dirname="${1}"
                scriptname="${2}"
                shift
                shift
            } || {
                error="Should provide DIRNAME and SCRIPTNAME for [${param}]"
            }
            ;;

        make_dist)
            action="make_dist"
            ;;
            
        clean_dist)
            action="clean_dist"
            ;;
            
        config)
            action="config"
            ;;

        -a|--author)
            author="${1}"
            shift
            ;;

        -h|--homepage)
            homepage="${1}"
            shift
            ;;

        -s|--support)
            support="${1}"
            shift
            ;;

        -f|--force)
            force="1"
            ;;

        -v|--set-version)
            version="${1}"
            shift
            ;;

        *)
            error="Don't understand [${param}]"
            ;;

    esac
    param="${1}"
    shift
done

[ -n "${error}" ] && fail "${error}"
[ -z "${action}" ] && fail "Don't know what to do"

"${action}"
