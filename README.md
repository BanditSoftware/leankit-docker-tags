# leankit-docker-tags

## Usage

```yaml
- uses: BanditSoftware/leankit-docker-tags
  id: vars
- run: echo "${{ steps.vars.output.tags }}"
- run: echo "${{ steps.vars.output.plainTags }}"
```
