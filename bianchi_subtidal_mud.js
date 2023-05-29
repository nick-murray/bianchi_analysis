var eez_checked = ee.FeatureCollection("users/murrnick/tidalFlat/zonalData/zoneData/EEZ_checked"),
    eez = ee.FeatureCollection("projects/global-intertidal-change/assets/EEZ_land_union_v3_202003"),
    st_mud = ee.Image("projects/coastal-training-libraries/assets/Bianchi_Analysis/M1_8_Subtidal_mud_plains");

// Imports
Map.addLayer(eez)
Map.addLayer(st_mud, {palette:'brown'})
var subversion = 'v2_0_8';

var gic2019 = ee.Image("projects/UQ_intertidal/global_intertidal_v2_0/outputs/gic_v2_0/L4_pp_error_vectors/L4_gic_20172019_".concat(subversion));

var site = 
    ee.Feature(
    ee.Geometry.Polygon([-180, 60, 0, 60, 180, 60, 180, -60, 10, -60, -180, -60], null, false))

var epoch = '2019';
var gicData = gic2019;

print(eez_checked,'eez')
// var eez = eez.map(function (feature) {
//     var eez_int = feature.intersection(site, 1000)
//     return eez_int.set ({
//       'zoneID':'eez',
//       'Country': feature.get('Country'),
//       'ISO_3digit': feature.get('ISO_3digit'),
//       'ISO_SOV1':feature.get('ISO_SOV1')
//     })}); 
// print (eez)

var newcollection = eez.map(function(f) {
     return ee.FeatureCollection(f.geometry().geometries().map(function(g) { 
        return ee.Feature(ee.Geometry(g)).set ({
      'zoneID':'eez',
      'Country': f.get('Country'),
      'ISO_3digit': f.get('ISO_3digit'),
      'ISO_SOV1':f.get('ISO_SOV1')
    })
     }))
}).flatten().filter(ee.Filter.or(
  ee.Filter.hasType(".geo", "Polygon"),
  ee.Filter.hasType(".geo", "MultiPolygon")))
print('newCollection', newcollection)


Export.table.toAsset(newcollection, 'eez', "projects/UQ_intertidal/global_intertidal_v2_0/dataMasks/eez_fixed")

// Basics
var area_reduction = 'eez';
var zonalData = newcollection;
Map.addLayer(zonalData)
print (eez)


var fileName = 'gicAreaDat_'
  .concat(epoch)
  .concat('_')
  .concat(area_reduction)
  .concat('_')
  .concat(subversion);
print ('filename', fileName);

// Area analysis
var getArea = function (feature){
  var feat = feature.select(['zoneID']);
 
  var cwAreaObject = gicData
    .select(['gic_cw_extent'])
    .multiply(ee.Image.pixelArea())
    .reduceRegion({
      reducer: ee.Reducer.sum(), 
      geometry: feature.geometry(),
      scale: 30,
      maxPixels:7e10,
    });
  var st_mudObject = st_mud
    .multiply(ee.Image.pixelArea())
    .reduceRegion({
      reducer: ee.Reducer.sum(), 
      geometry: feature.geometry(),
      scale: 1000,
      maxPixels:7e10,
    });

  var newDict = { 
      area_cw_km2: ee.Number(cwAreaObject.get('gic_cw_extent')).divide(1000 * 1000),
      area_stmud_km2:ee.Number(st_mudObject.get('b1')).divide(1000 * 1000),
      zoneID: feature.get('zoneID'),
      epoch: epoch,
      'Country': feature.get('Country'),
      'ISO_3digit': feature.get('ISO_3digit'),
      'ISO_SOV1':feature.get('ISO_SOV1')
  };
  return feat.set(newDict);
};
var areaCollection = zonalData.map(getArea);
print (areaCollection, 'areaCollection')

Export.table.toDrive({
  collection: areaCollection, //
  description: 'exportGeoJSON_'.concat(epoch),
  folder: 'Bianchi',
  fileNamePrefix: fileName,
  fileFormat: 'GeoJSON'
});

