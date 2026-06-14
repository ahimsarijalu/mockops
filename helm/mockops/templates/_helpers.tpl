{{- define "mockops.name" -}}
mockops
{{- end -}}

{{- define "mockops.labels" -}}
app.kubernetes.io/name: {{ include "mockops.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{- define "mockops.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mockops.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
