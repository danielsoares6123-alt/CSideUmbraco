using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common;
using System.Text.Json;

namespace Woosh.Controllers;

/// <summary>
/// Simple Content Management API for quick content manipulation.
/// Access via: /api/contentmanager/...
/// </summary>
[ApiController]
[Route("api/contentmanager")]
public class ContentManagerController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly IContentTypeService _contentTypeService;
    private readonly UmbracoHelper _umbracoHelper;

    public ContentManagerController(
        IContentService contentService,
        IContentTypeService contentTypeService,
        UmbracoHelper umbracoHelper)
    {
        _contentService = contentService;
        _contentTypeService = contentTypeService;
        _umbracoHelper = umbracoHelper;
    }

    /// <summary>
    /// List all content nodes or children of a specific node.
    /// GET /api/contentmanager/list
    /// GET /api/contentmanager/list?parentId=1234
    /// </summary>
    [HttpGet("list")]
    public IActionResult List([FromQuery] int? parentId = null)
    {
        try
        {
            IEnumerable<IContent> nodes;

            if (parentId.HasValue)
            {
                nodes = _contentService.GetPagedChildren(parentId.Value, 0, 100, out _);
            }
            else
            {
                nodes = _contentService.GetRootContent();
            }

            var result = nodes.Select(n => new
            {
                n.Id,
                n.Name,
                n.ContentType.Alias,
                Path = n.Path,
                HasChildren = _contentService.HasChildren(n.Id),
                Properties = n.Properties.Select(p => new { p.Alias, Value = p.GetValue()?.ToString() })
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific content node by ID.
    /// GET /api/contentmanager/get/1234
    /// </summary>
    [HttpGet("get/{id}")]
    public IActionResult Get(int id)
    {
        var content = _contentService.GetById(id);
        if (content == null) return NotFound();

        return Ok(new
        {
            content.Id,
            content.Name,
            content.ContentType.Alias,
            Path = content.Path,
            Properties = content.Properties.ToDictionary(p => p.Alias, p => p.GetValue()?.ToString())
        });
    }

    /// <summary>
    /// Update a property on a content node.
    /// GET /api/contentmanager/set?id=1234&property=partialName&value=CSideHero
    /// POST /api/contentmanager/set with JSON body
    /// </summary>
    [HttpGet("set")]
    [HttpPost("set")]
    public IActionResult Set(
        [FromQuery] int? id = null,
        [FromQuery] string? property = null,
        [FromQuery] string? value = null,
        [FromQuery] bool publish = true,
        [FromBody] SetContentRequest? body = null)
    {
        try
        {
            // Use body if provided, otherwise use query params
            var contentId = body?.Id ?? id;
            var propAlias = body?.Property ?? property;
            var propValue = body?.Value ?? value;
            var shouldPublish = body?.Publish ?? publish;

            if (!contentId.HasValue) return BadRequest("id is required");
            if (string.IsNullOrEmpty(propAlias)) return BadRequest("property is required");

            var content = _contentService.GetById(contentId.Value);
            if (content == null) return NotFound($"Content with ID {contentId} not found");

            content.SetValue(propAlias, propValue);
            _contentService.Save(content);

            if (shouldPublish)
            {
                _contentService.Publish(content, new[] { "*" });
            }

            return Ok(new
            {
                success = true,
                message = $"Updated {propAlias} = {propValue} on node {content.Name} (ID: {content.Id})",
                published = shouldPublish
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Create a new content node.
    /// GET /api/contentmanager/create?parentId=1234&name=NewNode&contentType=block&partialName=CSideHero
    /// </summary>
    [HttpGet("create")]
    [HttpPost("create")]
    public IActionResult Create(
        [FromQuery] int? parentId = null,
        [FromQuery] string? name = null,
        [FromQuery] string? contentType = null,
        [FromQuery] bool publish = true,
        [FromQuery] string? partialName = null,
        [FromBody] CreateContentRequest? body = null)
    {
        try
        {
            var parent = body?.ParentId ?? parentId;
            var nodeName = body?.Name ?? name;
            var docType = body?.ContentType ?? contentType;
            var shouldPublish = body?.Publish ?? publish;
            var partial = body?.PartialName ?? partialName;

            if (!parent.HasValue) return BadRequest("parentId is required");
            if (string.IsNullOrEmpty(nodeName)) return BadRequest("name is required");
            if (string.IsNullOrEmpty(docType)) return BadRequest("contentType is required");

            var contentTypeObj = _contentTypeService.Get(docType);
            if (contentTypeObj == null) return BadRequest($"Content type '{docType}' not found");

            var newContent = _contentService.Create(nodeName, parent.Value, docType);

            // Set partialName if provided (common for blocks)
            if (!string.IsNullOrEmpty(partial))
            {
                newContent.SetValue("partialName", partial);
            }

            // Set any additional properties from body
            if (body?.Properties != null)
            {
                foreach (var prop in body.Properties)
                {
                    newContent.SetValue(prop.Key, prop.Value);
                }
            }

            _contentService.Save(newContent);

            if (shouldPublish)
            {
                _contentService.Publish(newContent, new[] { "*" });
            }

            return Ok(new
            {
                success = true,
                id = newContent.Id,
                name = newContent.Name,
                message = $"Created node '{nodeName}' under parent {parent}",
                published = shouldPublish
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete a content node.
    /// GET /api/contentmanager/delete?id=1234
    /// </summary>
    [HttpGet("delete")]
    [HttpDelete("delete")]
    public IActionResult Delete([FromQuery] int id, [FromQuery] bool permanent = false)
    {
        try
        {
            var content = _contentService.GetById(id);
            if (content == null) return NotFound($"Content with ID {id} not found");

            var nodeName = content.Name;

            if (permanent)
            {
                _contentService.Delete(content);
            }
            else
            {
                _contentService.MoveToRecycleBin(content);
            }

            return Ok(new
            {
                success = true,
                message = permanent 
                    ? $"Permanently deleted '{nodeName}' (ID: {id})" 
                    : $"Moved '{nodeName}' (ID: {id}) to recycle bin"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get available content types (document types).
    /// GET /api/contentmanager/types
    /// </summary>
    [HttpGet("types")]
    public IActionResult GetContentTypes()
    {
        var types = _contentTypeService.GetAll()
            .Select(t => new
            {
                t.Id,
                t.Alias,
                t.Name,
                Properties = t.PropertyTypes.Select(p => new { p.Alias, p.Name, p.DataTypeId })
            });

        return Ok(types);
    }

    /// <summary>
    /// Quick tree view of content structure.
    /// GET /api/contentmanager/tree
    /// </summary>
    [HttpGet("tree")]
    public IActionResult Tree([FromQuery] int maxDepth = 3)
    {
        var roots = _contentService.GetRootContent();
        var tree = roots.Select(r => BuildTree(r, 0, maxDepth));
        return Ok(tree);
    }

    private object BuildTree(IContent node, int depth, int maxDepth)
    {
        var result = new
        {
            node.Id,
            node.Name,
            Type = node.ContentType.Alias,
            Children = depth < maxDepth && _contentService.HasChildren(node.Id)
                ? _contentService.GetPagedChildren(node.Id, 0, 50, out _).Select(c => BuildTree(c, depth + 1, maxDepth))
                : null
        };
        return result;
    }
}

public class SetContentRequest
{
    public int? Id { get; set; }
    public string? Property { get; set; }
    public string? Value { get; set; }
    public bool Publish { get; set; } = true;
}

public class CreateContentRequest
{
    public int? ParentId { get; set; }
    public string? Name { get; set; }
    public string? ContentType { get; set; }
    public string? PartialName { get; set; }
    public bool Publish { get; set; } = true;
    public Dictionary<string, string>? Properties { get; set; }
}
